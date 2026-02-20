import { NextResponse } from "next/server";
import { validatePassword } from "@/lib/validations";
import pool from "@/lib/db";
import crypto from "crypto";
import { transporter, mailOptions } from "@/lib/nodemailer";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    if (email.length < 14) {
      return NextResponse.json(
        { error: "Email must be at least 14 characters long" },
        { status: 400 }
      );
    }
    
    const { isValid, message } = validatePassword(password);
    if (!isValid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const existingUserResult = await pool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      
      if (!existingUser.EmailConfirmation) {
        return NextResponse.json(
          { error: "User has registered but email confirmation is not yet done. Please check your email." },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "User already registered. Please login." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const insertResult = await pool.query(
      'INSERT INTO "Users" ("Email", "Password", "EmailConfirmation", "VerificationToken", "VerificationTokenExpires") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, hashedPassword, false, verificationToken, verificationTokenExpires]
    );

    // Send verification email
    const origin = new URL(request.url).origin;
    const verificationLink = `${origin}/api/auth/verify?token=${verificationToken}`;
    
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    });

    return NextResponse.json(
      {
        message: "Signup successful. Please check your email to verify your account.",
        user: insertResult.rows[0],
      },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
