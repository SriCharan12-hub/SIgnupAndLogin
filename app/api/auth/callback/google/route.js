import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session?.user) {
      const { email } = data.session.user;
      
      try {
        // 1. Check if user exists in custom DB
        const result = await pool.query(
          'SELECT * FROM "Users" WHERE "Email" = $1',
          [email]
        );
        let user = result.rows[0];

        // 2. Create user if not exists
        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const insertResult = await pool.query(
                'INSERT INTO "Users" ("Email", "Password", "EmailConfirmation", "VerificationToken", "VerificationTokenExpires") VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [email, hashedPassword, true, null, null]
            );
            user = insertResult.rows[0];
        } else {
            // Confirm email if unconfirmed (since verified by Google)
            if (!user.EmailConfirmation) {
                await pool.query(
                    'UPDATE "Users" SET "EmailConfirmation" = $1, "VerificationToken" = NULL WHERE "Email" = $2',
                    [true, email]
                );
            }
        }

        // 3. Generate Custom JWT
        const token = jwt.sign(
            { id: user.id, email: user.Email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: "1d" }
        );

        // 4. Set Cookie and Redirect
        const response = NextResponse.redirect(`${origin}`);
        
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return response;

      } catch (dbError) {
        console.error("Database error during Google Auth:", dbError);
        return NextResponse.redirect(`${origin}/auth/error?error=database_error`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?error=auth_failed`);
}
