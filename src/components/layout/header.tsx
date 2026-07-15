"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { ConnectButton } from "@/components/wallet/connect-button";
import { truncateAddress } from "@/lib/utils/format";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { navLinks } from "./nav-links";

export function Header() {
  const { isAuthenticated, walletAddress } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-purple">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">ChainLearn</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && walletAddress && (
            <span className="hidden sm:block text-xs font-mono text-gray-500">
              {truncateAddress(walletAddress)}
            </span>
          )}
          <ConnectButton />

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && isAuthenticated && (
        <nav className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
