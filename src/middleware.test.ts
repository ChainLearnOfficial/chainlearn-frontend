import { describe, expect, it } from "vitest";

import { config, middleware } from "./middleware";
import { makeJwt } from "@/tests/helpers/jwt";

const ORIGIN = "https://chainlearn.test";
const VALID_SESSION = makeJwt({
  sub: "GABC123",
  exp: Math.floor(Date.now() / 1000) + 3600,
});

/**
 * Route protection at the Edge.
 *
 * The point of guarding here rather than in a client `useEffect` is that the
 * redirect happens before any protected markup is sent, so there is no frame in
 * which a signed-out visitor can see dashboard content.
 */

/**
 * Minimal NextRequest stand-in — middleware only reads nextUrl and cookies.
 * `nextUrl` is a URL plus the `clone()` NextURL adds, which the middleware uses
 * to build redirect targets.
 */
function makeNextUrl(pathname: string, search: string): URL & { clone: () => URL } {
  const url = new URL(`${pathname}${search}`, ORIGIN) as URL & {
    clone: () => URL;
  };
  url.clone = () => makeNextUrl(url.pathname, url.search);
  return url;
}

function makeRequest(pathname: string, sessionToken?: string, search = "") {
  const url = makeNextUrl(pathname, search);
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) =>
        name === "chainlearn-session" && sessionToken !== undefined
          ? { name, value: sessionToken }
          : undefined,
    },
  } as unknown as Parameters<typeof middleware>[0];
}

/** Where a response redirects to, or null when it passes through. */
function redirectTarget(response: ReturnType<typeof middleware>): URL | null {
  const location = response.headers.get("location");
  return location ? new URL(location) : null;
}

const PROTECTED = [
  "/dashboard",
  "/dashboard/settings",
  "/rewards",
  "/credentials",
  "/credentials/cred-123",
  "/courses/course-1",
  "/courses/course-1/modules/module-2",
  "/courses/course-1/quiz",
];

const PUBLIC = ["/", "/courses", "/verify/cred-123"];

describe("protected routes", () => {
  it.each(PROTECTED)("redirects %s to /connect without a session", (pathname) => {
    const target = redirectTarget(middleware(makeRequest(pathname)));

    expect(target).not.toBeNull();
    expect(target?.pathname).toBe("/connect");
  });

  it.each(PROTECTED)("allows %s with a valid session", (pathname) => {
    expect(
      redirectTarget(middleware(makeRequest(pathname, VALID_SESSION)))
    ).toBeNull();
  });

  it("preserves the intended destination so login can return there", () => {
    const target = redirectTarget(
      middleware(makeRequest("/courses/course-1/quiz"))
    );

    expect(target?.searchParams.get("redirect")).toBe("/courses/course-1/quiz");
  });

  it("redirects rather than rendering, so no protected markup is sent", () => {
    const response = middleware(makeRequest("/dashboard"));

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
  });

  it("rejects an expired JWT and clears the session cookie", () => {
    const expired = makeJwt({ sub: "GABC123", exp: 1 });
    const response = middleware(makeRequest("/dashboard", expired));

    expect(redirectTarget(response)?.pathname).toBe("/connect");
    expect(response.cookies.get("chainlearn-session")?.value).toBe("");
  });

  it.each([
    "",
    "not-a-jwt",
    "a.b.c",
    "..",
    "eyJhbGciOiJub25lIn0.e30.c2ln",
    "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE5MDAwMDAwMDB9.a",
  ])(
    "rejects malformed session token %s and clears the cookie",
    (token) => {
      const response = middleware(makeRequest("/dashboard", token));

      expect(redirectTarget(response)?.pathname).toBe("/connect");
      expect(response.cookies.get("chainlearn-session")?.value).toBe("");
    }
  );
});

describe("public routes", () => {
  it.each(PUBLIC)("leaves %s accessible when signed out", (pathname) => {
    expect(redirectTarget(middleware(makeRequest(pathname)))).toBeNull();
  });

  it.each(PUBLIC)("leaves %s accessible when signed in", (pathname) => {
    expect(
      redirectTarget(middleware(makeRequest(pathname, VALID_SESSION)))
    ).toBeNull();
  });

  it("treats the /courses listing as public but its detail pages as protected", () => {
    expect(redirectTarget(middleware(makeRequest("/courses")))).toBeNull();
    expect(redirectTarget(middleware(makeRequest("/courses/abc")))?.pathname).toBe(
      "/connect"
    );
  });

  it("allows /connect when signed out", () => {
    expect(redirectTarget(middleware(makeRequest("/connect")))).toBeNull();
  });
});

describe("auth routes", () => {
  it("bounces a signed-in visitor away from /connect", () => {
    expect(
      redirectTarget(middleware(makeRequest("/connect", VALID_SESSION)))?.pathname
    ).toBe("/dashboard");
  });

  it("bounces a signed-in visitor away from /onboarding", () => {
    expect(
      redirectTarget(middleware(makeRequest("/onboarding", VALID_SESSION)))?.pathname
    ).toBe("/dashboard");
  });

  it("honours the redirect parameter after signing in", () => {
    const target = redirectTarget(
      middleware(makeRequest("/connect", VALID_SESSION, "?redirect=/rewards"))
    );

    expect(target?.pathname).toBe("/rewards");
    expect(target?.searchParams.get("redirect")).toBeNull();
  });

  it("leaves /onboarding accessible while signed out", () => {
    expect(redirectTarget(middleware(makeRequest("/onboarding")))).toBeNull();
  });
});

describe("matcher", () => {
  it("covers every protected area and both auth routes", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/dashboard/:path*",
        "/rewards/:path*",
        "/credentials/:path*",
        "/courses/:courseId/:path*",
        "/connect",
        "/onboarding",
      ])
    );
  });

  it("does not run on public routes", () => {
    for (const pattern of config.matcher) {
      expect(pattern).not.toBe("/");
      expect(pattern).not.toMatch(/^\/verify/);
      expect(pattern).not.toBe("/courses");
    }
  });
});

describe("edge runtime compatibility", () => {
  it("runs without Node built-ins available", () => {
    expect(() => middleware(makeRequest("/dashboard"))).not.toThrow();
    expect(() => middleware(makeRequest("/dashboard", "jwt"))).not.toThrow();
  });
});
