"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {hasHydrated && isAuthenticated && <Sidebar />}
        <main className="flex-1">
          {/* key={pathname} remounts the div on route change so the fadeIn
              animation replays instead of only running on initial load. */}
          <div id="page-content" key={pathname}>
            {children}
          </div>
        </main>
      </div>
      {hasHydrated && isAuthenticated && <MobileNav />}
    </div>
  );
}
