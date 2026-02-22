import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";
import { generateMfaToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { createRateLimiter } from "@/lib/rateLimit";
import { transporter, mailOptions } from "@/lib/nodemailer";

// 10 login attempts per 60 seconds per IP
const loginRateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request) {
  // HTTP-level rate limiting
  const { success, retryAfter } = loginRateLimiter(request);
  if (!success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const { email, password, rememberMe = false } = await request.json();

    //  Validate Input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 },
      );
    }

    //find user
    const result = await pool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [normalizedEmail],
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    //check lockout

    if (user.LockoutUntil && new Date(user.LockoutUntil) > new Date()) {
      return NextResponse.json(
        { error: "Account locked. Try again later." },
        { status: 403 },
      );
    }

    //Verify password
    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      const FailedLoginAttempts = (user.FailedLoginAttempts || 0) + 1;

      // Lock after 5 failed attempts
      if (FailedLoginAttempts >= 5) {
        await pool.query(
          `UPDATE "Users"
           SET "FailedLoginAttempts" = $1,
               "LockoutUntil" = NOW() + interval '15 minutes'
           WHERE "Email" = $2`,
          [FailedLoginAttempts, normalizedEmail],
        );

        return NextResponse.json(
          {
            error:
              "Account locked due to multiple failed attempts. Try again in 15 minutes.",
          },
          { status: 403 },
        );
      }

      await pool.query(
        `UPDATE "Users"
         SET "FailedLoginAttempts" = $1
         WHERE "Email" = $2`,
        [FailedLoginAttempts, normalizedEmail],
      );

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    //check email confirmation

    if (!user.EmailConfirmation) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 },
      );
    }

    //reset failed attempts

    await pool.query(
      `UPDATE "Users"
       SET "FailedLoginAttempts" = 0,
           "LockoutUntil" = NULL
       WHERE "Email" = $1`,
      [normalizedEmail],
    );

    // ── MFA: Generate 6-digit OTP ──────────────────────────────────────────
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // "382910"
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save hashed OTP to DB
    await pool.query(
      `UPDATE "Users" SET "MfaOtp" = $1, "MfaOtpExpires" = $2 WHERE "Email" = $3`,
      [otpHash, otpExpires, normalizedEmail],
    );

    // Email the OTP
    await transporter.sendMail({
      ...mailOptions,
      to: normalizedEmail,
      subject: "Your login verification code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#111827;margin-bottom:8px;">Verification Code</h2>
          <p style="color:#6b7280;margin-bottom:24px;">Use this code to complete your login. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;text-align:center;">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#111827;">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't try to log in, you can safely ignore this email.</p>
        </div>
      `,
    });

    // Issue a short-lived MFA bridge token (5 min) — NOT the real access token
    const mfaToken = generateMfaToken(user.id);

    return NextResponse.json({ mfaPending: true, mfaToken }, { status: 200 });
    // ───────────────────────────────────────────────────────────────────────
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
