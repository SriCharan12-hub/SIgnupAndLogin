import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Validate Input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }
    
    // 3. Check User
    const result = await pool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [email]
    );
    const user = result.rows[0];
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // 4. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.Password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // 5. Check Email Confirmation
    if (!user.EmailConfirmation) {
      return NextResponse.json(
        { error: "Please confirm your email first" },
        { status: 403 }
      );
    }

    // 6. Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.Email },
      process.env.JWT_SECRET || 'fallback_secret', // Ensure secret exists
      { expiresIn: "1d" }
    );

    // Remove password from response
    const { Password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
