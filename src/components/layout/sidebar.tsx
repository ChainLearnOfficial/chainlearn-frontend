"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils/cn";
import { isNavLinkActive, navLinks } from "./nav-links";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-stellar-purple text-white shadow-lg hover:bg-purple-700 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-4 shadow-2xl transition-transform duration-300 dark:bg-gray-900",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Navigation</span>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Mobile course navigation" className="mt-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-stellar-purple text-white shadow-md shadow-stellar-purple/20"
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

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-200 bg-gray-50/50 min-h-[calc(100vh-4rem)] transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50 relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <nav aria-label="Course navigation" className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);
            const content = (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-stellar-purple text-white shadow-sm font-semibold dark:bg-stellar-purple dark:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{link.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return content;
          })}
        </nav>
      </aside>
    </>
  );
}
