import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL('/auth/error?error=missing_token', request.url));
  }

  try {
    // Find user with this token
    const result = await pool.query(
      'SELECT * FROM "Users" WHERE "VerificationToken" = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', request.url));
    }

    const user = result.rows[0];

    // Check expiration
    if (new Date(user.VerificationTokenExpires) < new Date()) {
       return NextResponse.redirect(new URL('/auth/error?error=token_expired', request.url));
    }

    // Update user
    await pool.query(
      'UPDATE "Users" SET "EmailConfirmation" = $1, "VerificationToken" = NULL, "VerificationTokenExpires" = NULL WHERE "id" = $2',
      [true, user.id]
    );

    // Redirect to login with success indicator
    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL('/auth/error?error=server_error', request.url));
  }
}
