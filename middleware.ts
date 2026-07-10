import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/api/auth",
  "/api/pay/webhook",
  "/api/admin/auth",
  "/admin/login",
];

const AUTH_PATHS = ["/login", "/signup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Simple in-memory rate limiting (per-IP, resets on cold start)
// For production scale: replace with Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin panel — password-protect with session cookie
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminCookie = request.cookies.get("admin_session")?.value;
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || adminCookie !== adminSecret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    // Stricter limit on AI endpoints
    if (pathname.startsWith("/api/ai/")) {
      if (!rateLimit(ip, 60, 60_000)) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
    }

    // Auth endpoints
    if (pathname.startsWith("/api/auth/")) {
      if (!rateLimit(ip, 10, 60_000)) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
    }
  }

  // Refresh Supabase session
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect authenticated users away from auth pages
  if (user && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect app routes
  if (!user && !isPublic(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
