import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Instagram from "next-auth/providers/instagram";
import Pinterest from "next-auth/providers/pinterest";
import pool from "@/lib/DbConnection/db";
export const {
  handlers,
  auth,
  signIn: nextAuthSignIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,

  // Required in NextAuth v5 for local/non-HTTPS environments
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRECT_ID,
      // Disable PKCE — fixes "pkceCodeVerifier value could not be parsed"
      // on localhost where the PKCE cookie is lost between redirect and callback
      checks: ["state"],
    }),
    Facebook({
      clientId: process.env.META_CLIENT_ID,
      clientSecret: process.env.META_SECRECT_KEY,
    }),
    Instagram({
      clientId: process.env.META_CLIENT_ID,
      clientSecret: process.env.META_SECRECT_KEY,
    }),
    Pinterest({
      clientId: process.env.PINTEREST_CLIENT_ID,
      clientSecret: process.env.PINTEREST_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    /**
     * Fires after Google returns the user.
     * We upsert into our custom Users table here.
     */
    async signIn({ user, account }) {
      // Only intercept OAuth providers — let credential logins pass through
      if (
        !["google", "facebook", "instagram", "pinterest"].includes(
          account?.provider,
        )
      )
        return true;

      const email = user.email?.trim().toLowerCase();
      if (!email) return "/auth/error?error=OAuthAccountNotLinked";

      try {
        const existing = await pool.query(
          'SELECT id FROM "Users" WHERE "Email" = $1',
          [email],
        );

        if (existing.rows.length === 0) {
          // New OAuth user — insert into custom Users table
          await pool.query(
            `INSERT INTO "Users"
               ("Email", "Password", "EmailConfirmation",
                "VerificationToken", "VerificationTokenExpiry",
                "FailedLoginAttempts", "LockoutUntil",
                "PasswordResetToken", "PasswordResetTokenExpiry",
                "provider")
             VALUES ($1, NULL, TRUE, NULL, NULL, 0, NULL, NULL, NULL, $2)`,
            [email, account.provider],
          );
        }
        // Existing user — allow login, skip insert
        return true;
      } catch (err) {
        console.error("[NextAuth signIn] DB error:", err.message);
        // Return a redirect URL string on error (v5 style)
        return "/auth/error?error=DatabaseError";
      }
    },

    /**
     * Enrich the JWT token with our DB user id on first sign-in.
     */
    async jwt({ token, account }) {
      // Only fetch from DB on the initial sign-in (account is only available then)
      if (
        ["google", "facebook", "instagram", "pinterest"].includes(
          account?.provider,
        ) &&
        token.email
      ) {
        try {
          const result = await pool.query(
            'SELECT id FROM "Users" WHERE "Email" = $1',
            [token.email.trim().toLowerCase()],
          );
          if (result.rows.length > 0) {
            token.dbUserId = result.rows[0].id;
            token.provider = account.provider;
          }
        } catch (err) {
          console.error("[NextAuth jwt] DB error:", err.message);
        }
      }
      return token;
    },

    /**
     * Expose dbUserId and provider on the client-side session.
     */
    async session({ session, token }) {
      if (token?.dbUserId) {
        session.user.id = token.dbUserId;
      }
      if (token?.provider) {
        session.user.provider = token.provider;
      }
      return session;
    },
  },
});
