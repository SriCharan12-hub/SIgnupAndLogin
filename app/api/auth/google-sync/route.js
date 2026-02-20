import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

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

    // 4. Set Cookie and Return Success
    const response = NextResponse.json({ success: true, user: { email: user.Email, id: user.id } });
    
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    });

    return response;

  } catch (dbError) {
    console.error("Database error during Google Sync:", dbError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
