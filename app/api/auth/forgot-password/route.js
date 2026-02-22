import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";
import crypto from "crypto";
import { transporter, mailOptions } from "@/lib/nodemailer";
import { createRateLimiter } from "@/lib/rateLimit";

// Stricter: 5 reset requests per 60 seconds per IP
const forgotPasswordRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60_000,
});

export async function POST(request) {
  // HTTP-level rate limiting
  const { success, retryAfter } = forgotPasswordRateLimiter(request);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 },
      );
    }

    // Always return success to avoid leaking whether email exists
    const result = await pool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      // Return success response to prevent email enumeration
      return NextResponse.json(
        {
          message:
            "If that email is registered, you'll receive a reset link shortly.",
        },
        { status: 200 },
      );
    }

    const user = result.rows[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token in DB
    await pool.query(
      `UPDATE "Users"
       SET "PasswordResetToken" = $1,
           "PasswordResetTokenExpires" = $2
       WHERE "Email" = $3`,
      [resetToken, resetTokenExpires, normalizedEmail],
    );

    // Build reset link
    const origin = new URL(request.url).origin;
    const resetLink = `${origin}/auth/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      ...mailOptions,
      to: normalizedEmail,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #111827; margin-bottom: 8px;">Password Reset Request</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to choose a new one.
            This link will expire in <strong>1 hour</strong>.
          </p>
          <a href="${resetLink}"
             style="display:inline-block; background:#333333; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; letter-spacing:0.5px;">
            Reset Password
          </a>
          <p style="color:#9ca3af; font-size:12px; margin-top:24px;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </p>
          <hr style="border:none; border-top:1px solid #f3f4f6; margin:24px 0;" />
          <p style="color:#d1d5db; font-size:11px;">Or copy this link into your browser:<br/>${resetLink}</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message:
          "If that email is registered, you'll receive a reset link shortly.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
