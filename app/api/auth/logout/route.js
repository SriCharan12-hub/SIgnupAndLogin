import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear Custom Auth Cookies
  response.cookies.set("accessToken", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("refreshToken", "", {
    maxAge: 0,
    path: "/",
  });

  // Clear NextAuth / Auth.js Cookies
  // Standard development token
  response.cookies.set("authjs.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });

  // Secure production tokens (prefixed with __Secure-)
  response.cookies.set("__Secure-authjs.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("__Secure-next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });

  // CSRF tokens (best practice to clear these too)
  response.cookies.set("next-auth.csrf-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("authjs.csrf-token", "", { maxAge: 0, path: "/" });

  return response;
}
