import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Find user with valid token
      const result = await client.query(
        'SELECT * FROM "Users" WHERE "VerificationToken" = $1 AND "VerificationTokenExpires" > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
      }

      const user = result.rows[0];

      // Update user status
      await client.query(
        'UPDATE "Users" SET "EmailConfirmation" = $1, "VerificationToken" = $2, "VerificationTokenExpires" = $3 WHERE "id" = $4',
        [true, null, null, user.id]
      );

      // Redirect to login page
      return NextResponse.redirect(new URL("/auth/login?verified=true", request.url));
      
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
