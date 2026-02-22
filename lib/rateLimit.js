/**
 * In-memory sliding-window rate limiter.
 * No extra npm packages needed — uses a plain Map keyed by IP.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
 *   const { success, retryAfter } = limiter(request);
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */

const stores = new Map(); // one Map entry per limiter instance

export function createRateLimiter({ limit = 10, windowMs = 60_000 } = {}) {
  // Each limiter gets its own isolated store
  const store = new Map();
  stores.set(store, true);

  return function rateLimiter(request) {
    // Extract IP: works behind proxies (Vercel, nginx) and locally
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = (forwarded ? forwarded.split(",")[0] : realIp) || "127.0.0.1";

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetTime) {
      // First request or window has expired — start fresh
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return { success: true, retryAfter: 0 };
    }

    entry.count += 1;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000); // seconds
      return { success: false, retryAfter };
    }

    return { success: true, retryAfter: 0 };
  };
}
