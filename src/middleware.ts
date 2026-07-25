import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/rewards", "/credentials"];
const authRoutes = ["/connect", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("chainlearn-session")?.value;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/connect";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (sessionToken) {
      const redirect = request.nextUrl.searchParams.get("redirect");
      const url = request.nextUrl.clone();
      url.pathname = redirect || "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/rewards/:path*", "/credentials/:path*", "/connect", "/onboarding"],
};
