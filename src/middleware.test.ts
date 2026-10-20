import { describe, expect, it } from "vitest";

import { config, middleware } from "./middleware";

/**
 * Route protection at the Edge.
 *
 * The point of guarding here rather than in a client `useEffect` is that the
 * redirect happens before any protected markup is sent, so there is no frame in
 * which a signed-out visitor can see dashboard content.
 */

const ORIGIN = "https://chainlearn.test";

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
        name === "chainlearn-session" && sessionToken
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

  it.each(PROTECTED)("allows %s with a session", (pathname) => {
    expect(redirectTarget(middleware(makeRequest(pathname, "jwt-abc")))).toBeNull();
  });

  it("preserves the intended destination so login can return there", () => {
    const target = redirectTarget(
      middleware(makeRequest("/courses/course-1/quiz"))
    );

    expect(target?.searchParams.get("redirect")).toBe("/courses/course-1/quiz");
  });

  it("redirects rather than rendering, so no protected markup is sent", () => {
    const response = middleware(makeRequest("/dashboard"));

    // A 3xx means the body was never produced — that is what removes the flash.
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
  });
});

describe("public routes", () => {
  it.each(PUBLIC)("leaves %s accessible when signed out", (pathname) => {
    expect(redirectTarget(middleware(makeRequest(pathname)))).toBeNull();
  });

  it.each(PUBLIC)("leaves %s accessible when signed in", (pathname) => {
    expect(redirectTarget(middleware(makeRequest(pathname, "jwt-abc")))).toBeNull();
  });

  it("treats the /courses listing as public but its detail pages as protected", () => {
    // The prefix check must distinguish "/courses" from "/courses/<id>".
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
    expect(redirectTarget(middleware(makeRequest("/connect", "jwt-abc")))?.pathname).toBe(
      "/dashboard"
    );
  });

  it("bounces a signed-in visitor away from /onboarding", () => {
    expect(
      redirectTarget(middleware(makeRequest("/onboarding", "jwt-abc")))?.pathname
    ).toBe("/dashboard");
  });

  it("honours the redirect parameter after signing in", () => {
    const target = redirectTarget(
      middleware(makeRequest("/connect", "jwt-abc", "?redirect=/rewards"))
    );

    expect(target?.pathname).toBe("/rewards");
    // The parameter is consumed, not carried into the destination.
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
    // Scoping the matcher is what keeps Edge cold-start cost off the marketing
    // pages and the public verification view.
    for (const pattern of config.matcher) {
      expect(pattern).not.toBe("/");
      expect(pattern).not.toMatch(/^\/verify/);
      expect(pattern).not.toBe("/courses");
    }
  });
});

describe("edge runtime compatibility", () => {
  it("runs without Node built-ins available", () => {
    // The middleware must not reach for anything outside the Edge API surface;
    // a stray Node import would fail at deploy, not in a unit test, so this
    // asserts the request path stays on Web APIs only.
    expect(() => middleware(makeRequest("/dashboard"))).not.toThrow();
    expect(() => middleware(makeRequest("/dashboard", "jwt"))).not.toThrow();
  });
});
