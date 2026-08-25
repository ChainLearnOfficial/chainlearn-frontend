import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require a valid session cookie.
 * The matcher below restricts middleware to only these path prefixes
 * (plus auth routes) so Edge cold-start cost is minimal.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/rewards",
  "/credentials",
  "/courses/", // individual course pages, modules, quiz — NOT /courses list
];

/**
 * Routes where an already-authenticated user should be bounced away
 * (e.g. don't show the connect screen to someone who's already in).
 */
const AUTH_PREFIXES = ["/connect", "/onboarding"];

/**
 * /courses (the listing page) is public — only sub-paths are protected.
 * This helper distinguishes "/courses" from "/courses/<id>/…".
 */
function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("chainlearn-session")?.value;

  // --- Guard protected routes ---
  if (isProtected(pathname)) {
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/connect";
      // Preserve the intended destination so the connect page can redirect
      // back after a successful wallet login.
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- Bounce authenticated users away from auth pages ---
  if (isAuthRoute(pathname)) {
    if (sessionToken) {
      const redirect = request.nextUrl.searchParams.get("redirect");
      const url = request.nextUrl.clone();
      url.pathname = redirect || "/dashboard";
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Run middleware only on the routes we care about.
 * Public routes (/, /courses, /verify/*) are intentionally excluded
 * so they are never touched by this middleware.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rewards/:path*",
    "/credentials/:path*",
    "/courses/:courseId/:path*", // individual course + sub-pages only
    "/connect",
    "/onboarding",
  ],
};
