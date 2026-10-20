"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils/cn";
import { isNavLinkActive, navLinks } from "./nav-links";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { truncateAddress } from "@/lib/utils/format";

export function MobileNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const walletAddress = useAuthStore((s) => s.walletAddress);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const touchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setSwipeStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const swipeEndX = e.changedTouches[0].clientX;
      const diff = swipeEndX - swipeStartX;
      if (Math.abs(diff) > 50 && diff > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const nav = touchRef.current;
    if (nav) {
      nav.addEventListener("touchstart", handleTouchStart);
      nav.addEventListener("touchend", handleTouchEnd);
      return () => {
        nav.removeEventListener("touchstart", handleTouchStart);
        nav.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [swipeStartX]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <nav
      ref={touchRef}
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 lg:hidden transition-transform duration-300"
    >
      {/* User Info Section */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{walletAddress ? getInitials(walletAddress) : "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Account</p>
            <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
              {walletAddress ? truncateAddress(walletAddress) : "Not connected"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center justify-evenly px-1 py-1">
        {navLinks.map((link) => {
          const isActive = isNavLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-14 w-14 flex-col items-center gap-0.5 rounded-lg text-[10px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:h-16 sm:w-16 sm:text-xs",
                isActive
                  ? "bg-stellar-purple/10 text-stellar-purple dark:bg-stellar-purple/20"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              <link.icon className="h-5 w-5 shrink-0 transition-transform duration-200" aria-hidden="true" />
              <span className="max-sm:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
