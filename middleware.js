import { NextResponse } from "next/server";

export function middleware(request) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;

  // 1. Define Route Categories
  const isAuthPage = path.startsWith("/auth");
  const isApiAuth = path.startsWith("/api/auth");
  const isPublicStatic = path.match(/\.(.*)$/); // images, fonts, etc.

  // Publicly accessible pages even when logged out
  const publicPages = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/terms",
    "/auth/privacy",
    "/auth/reset-password",
  ];

  const isPublicPage = publicPages.includes(path);

  // 2. Auth State
  // We check for custom JWT tokens OR NextAuth session cookies
  const hasCustomToken =
    cookies.has("accessToken") || cookies.has("refreshToken");
  const hasNextAuthToken =
    cookies.has("authjs.session-token") ||
    cookies.has("next-auth.session-token") ||
    cookies.has("__Secure-authjs.session-token") ||
    cookies.has("__Secure-next-auth.session-token");

  const hasToken = hasCustomToken || hasNextAuthToken;

  // 3. Protection Logic

  // Rule A: If user is logged in and tries to go to Login/Signup → Redirect to Home
  if (hasToken && (path === "/auth/login" || path === "/auth/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rule B: If user is logged OUT and tries to go to a Private Page → Redirect to Login
  // Exemptions: Auth pages, API auth routes, static assets, next internals
  const isNextInternal = path.startsWith("/_next");

  if (
    !hasToken &&
    !isPublicPage &&
    !isApiAuth &&
    !isNextInternal &&
    !isPublicStatic
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes should trigger middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except /api/auth which we handle in logic)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
