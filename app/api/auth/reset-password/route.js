import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";
import bcrypt from "bcrypt";
import { validatePassword } from "@/lib/validations";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      );
    }

    // Validate password strength
    const { isValid, message } = validatePassword(newPassword);
    if (!isValid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Look up user by token and check expiry
    const result = await pool.query(
      `SELECT * FROM "Users"
       WHERE "PasswordResetToken" = $1
         AND "PasswordResetTokenExpires" > NOW()`,
      [token],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired password reset link. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const user = result.rows[0];

    // Check if new password is same as current password
    if (user.Password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.Password);
      if (isSamePassword) {
        return NextResponse.json(
          {
            error:
              "New password cannot be the same as your old password. Please choose a different one.",
          },
          { status: 400 },
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE "Users"
       SET "Password" = $1,
           "PasswordResetToken" = NULL,
           "PasswordResetTokenExpires" = NULL,
           "FailedLoginAttempts" = 0,
           "LockoutUntil" = NULL
       WHERE "id" = $2`,
      [hashedPassword, user.id],
    );

    return NextResponse.json(
      {
        message:
          "Password updated successfully. You can now log in with your new password.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
