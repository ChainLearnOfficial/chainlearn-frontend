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
  "/settings",
  "/courses/", // individual course pages, modules, quiz — NOT /courses list
];

/**
 * Routes where an already-authenticated user should be bounced away
 * (e.g. don't show the connect screen to someone who's already in).
 */
const AUTH_PREFIXES = ["/connect", "/onboarding"];

function decodeBase64UrlJson(segment: string): unknown | null {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

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

/**
 * Reject open-redirect targets (#541). Only same-origin relative paths are
 * allowed: must start with a single "/", must not be protocol-relative
 * ("//evil.com"), and must not embed a scheme ("https://evil.com").
 */
function isSafeRedirectPath(redirect: string | null): redirect is string {
  if (!redirect) return false;
  if (!redirect.startsWith("/")) return false;
  if (redirect.startsWith("//")) return false;
  if (redirect.includes("://")) return false;
  if (redirect.includes("\\")) return false;
  return true;
}

/**
 * Decode JWT payload and check expiry (#495).
 * Uses atob() for base64 decoding — works in Edge runtime.
 * Malformed tokens are treated as expired.
 */
function isJwtExpired(token: string): boolean {
/** Validate JWT structure and expiry; signature verification remains server-side. */
function isValidSessionToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (
      parts.length !== 3 ||
      parts.some(
        (part) =>
          !part || part.length % 4 === 1 || !/^[A-Za-z0-9_-]+$/.test(part)
      )
    ) {
      return false;
    }

    const header = decodeBase64UrlJson(parts[0]);
    if (
      !header ||
      typeof header !== "object" ||
      typeof (header as { alg?: unknown }).alg !== "string" ||
      (header as { alg: string }).alg.toLowerCase() === "none"
    ) {
      return false;
    }

    const payload = decodeBase64UrlJson(parts[1]);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return false;
    }
    const expiry = (payload as { exp?: unknown }).exp;
    return (
      typeof expiry === "number" &&
      Number.isFinite(expiry) &&
      expiry * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

function redirectToConnect(request: NextRequest, clearCookie = false) {
  const url = request.nextUrl.clone();
  url.pathname = "/connect";
  if (isProtected(request.nextUrl.pathname)) {
    url.searchParams.set("redirect", request.nextUrl.pathname);
  }
  const response = NextResponse.redirect(url);
  if (clearCookie) response.cookies.delete("chainlearn-session");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("chainlearn-session");
  const sessionToken = sessionCookie?.value;
  const validSession = sessionToken ? isValidSessionToken(sessionToken) : false;

  if (sessionCookie && !validSession) {
    if (pathname === "/connect") {
      const response = NextResponse.next();
      response.cookies.delete("chainlearn-session");
      return response;
    }
    return redirectToConnect(request, true);
  }

  // --- Guard protected routes ---
  if (isProtected(pathname)) {
    if (!validSession) {
      return redirectToConnect(request);
    }
  }

  // --- Bounce authenticated users away from auth pages ---
  if (isAuthRoute(pathname)) {
    if (validSession) {
      const redirect = request.nextUrl.searchParams.get("redirect");
      const url = request.nextUrl.clone();
      url.pathname = isSafeRedirectPath(redirect) ? redirect : "/dashboard";
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
    "/settings/:path*",
    "/courses/:courseId/:path*", // individual course + sub-pages only
    "/connect",
    "/onboarding",
  ],
};
