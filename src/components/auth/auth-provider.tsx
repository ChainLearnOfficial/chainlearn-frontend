"use client";

import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {hasHydrated && isAuthenticated && <Sidebar />}
        <main className="flex-1">
          <div id="page-content">{children}</div>
        </main>
      </div>
      {hasHydrated && isAuthenticated && <MobileNav />}
    </div>
  );
}
