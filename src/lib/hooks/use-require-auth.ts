"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

/**
 * Gate a client page on an authenticated session.
 *
 * `src/middleware.ts` is the primary guard: it redirects unauthenticated
 * requests to /connect at the Edge, before any protected markup is sent, which
 * is what removes the flash of protected content.
 *
 * This hook is the second layer, and it exists for the cases the middleware
 * cannot see:
 *
 *   - The middleware only checks that the `chainlearn-session` cookie is
 *     *present*. A cookie cleared in devtools while the persisted store still
 *     says "authenticated", or a client-side navigation that never hits the
 *     Edge, both slip past it.
 *   - The persisted store rehydrates asynchronously. Rendering before that
 *     finishes shows a signed-in page with null data for a frame.
 *
 * Previously this logic was copy-pasted into /dashboard, /credentials and
 * /rewards. Centralising it means the three cannot drift apart.
 *
 * @returns `ready` — true once the store has hydrated and the session is
 * confirmed. Callers should render a skeleton (not `null`) while it is false,
 * so the page does not blink from blank to content.
 */
export function useRequireAuth(): { ready: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/connect");
    }
  }, [hasHydrated, isAuthenticated, router]);

  return { ready: hasHydrated && isAuthenticated, isAuthenticated };
}
