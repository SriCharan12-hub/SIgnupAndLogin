import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimit";

const mfaRateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request) {
  // Rate limit OTP verification attempts
  const { success, retryAfter } = mfaRateLimiter(request);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const { otp, mfaToken, rememberMe = false } = await request.json();

    if (!otp || !mfaToken) {
      return NextResponse.json(
        { error: "OTP and MFA token are required" },
        { status: 400 },
      );
    }

    // Verify the short-lived MFA bridge token
    let payload;
    try {
      payload = jwt.verify(mfaToken, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 },
      );
    }

    // Must be an MFA-purpose token, not a regular access token
    if (payload.purpose !== "mfa") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId } = payload;

    // Fetch user + their stored OTP hash
    const result = await pool.query('SELECT * FROM "Users" WHERE "id" = $1', [
      userId,
    ]);

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check lockout status
    if (user.LockoutUntil && new Date(user.LockoutUntil) > new Date()) {
      return NextResponse.json(
        {
          error:
            "Account locked due to multiple failed attempts. Try again later.",
        },
        { status: 403 },
      );
    }

    // Check OTP expiry
    if (!user.MfaOtpExpires || new Date(user.MfaOtpExpires) < new Date()) {
      return NextResponse.json(
        { error: "Code expired. Please log in again." },
        { status: 401 },
      );
    }

    // Compare OTP against stored hash
    const otpMatch = await bcrypt.compare(String(otp), user.MfaOtp);

    if (!otpMatch) {
      const failedAttempts = (user.FailedLoginAttempts || 0) + 1;

      // Lock after 5 failed attempts (consistent with password login)
      if (failedAttempts >= 5) {
        await pool.query(
          `UPDATE "Users" 
           SET "FailedLoginAttempts" = $1, 
               "LockoutUntil" = NOW() + interval '15 minutes' 
           WHERE "id" = $2`,
          [failedAttempts, userId],
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
        `UPDATE "Users" SET "FailedLoginAttempts" = $1 WHERE "id" = $2`,
        [failedAttempts, userId],
      );

      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 401 },
      );
    }

    // OTP correct — clear it and reset failed attempts
    await pool.query(
      `UPDATE "Users" 
       SET "MfaOtp" = NULL, 
           "MfaOtpExpires" = NULL, 
           "FailedLoginAttempts" = 0, 
           "LockoutUntil" = NULL 
       WHERE "id" = $1`,
      [userId],
    );

    // Generate real auth tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.Email });
    const refreshToken = generateRefreshToken({ id: user.id });

    const { Password, MfaOtp, MfaOtpExpires, ...safeUser } = user;

    const response = NextResponse.json(
      { message: "Login successful", user: safeUser },
      { status: 200 },
    );

    // Cookie durations: 30 days if Remember Me, else session-scoped
    const ACCESS_MAX_AGE = rememberMe ? 30 * 24 * 60 * 60 : 15 * 60;
    const REFRESH_MAX_AGE = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ACCESS_MAX_AGE,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify MFA Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
