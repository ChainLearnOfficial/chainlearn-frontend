"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils/cn";
import { isNavLinkActive, navLinks } from "./nav-links";

export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-gray-50/50 min-h-[calc(100vh-4rem)] dark:border-gray-800 dark:bg-gray-900/50">
      <nav aria-label="Course navigation" className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = isNavLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
