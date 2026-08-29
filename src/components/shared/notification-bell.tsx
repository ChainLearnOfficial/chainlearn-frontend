"use client";

import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Gift,
  Info,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useNotifications } from "@/lib/hooks/use-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { AppNotification, NotificationType } from "@/types/notification";
import { formatRelativeTime } from "@/lib/utils/format";

const typeIcons: Record<NotificationType, LucideIcon> = {
  reward_claimed: Gift,
  course_completed: CheckCircle2,
  credential_minted: ShieldCheck,
  announcement: Megaphone,
  system: Info,
};

const typeStyles: Record<NotificationType, string> = {
  reward_claimed: "text-green-600 dark:text-green-400",
  course_completed: "text-primary-600 dark:text-primary-400",
  credential_minted: "text-stellar-purple",
  announcement: "text-amber-600 dark:text-amber-400",
  system: "text-gray-500 dark:text-gray-400",
};

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative p-2 text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg dark:text-gray-300 dark:hover:text-gray-100"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {loading ? (
            <div className="space-y-3 p-4" aria-label="Loading notifications">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText className="w-3/4" />
                    <SkeletonText className="w-1/3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Bell className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Couldn&apos;t load notifications
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={refetch}
                className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Bell className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No notifications
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Rewards, credentials and announcements will show up here.
              </p>
            </div>
) : (
            <div>
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] ?? Info;
                const unread = !notification.read;
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={() => markAsRead(notification.id)}
                    className={cn(
                      "cursor-pointer items-start gap-3 px-4 py-3",
                      unread && "bg-primary-50/60 dark:bg-primary-950/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800",
                        typeStyles[notification.type]
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread
                              ? "font-semibold text-gray-900 dark:text-gray-100"
                              : "font-medium text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {notification.title}
                        </span>
                        {unread && (
                          <span
                            className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      {notification.message && (
                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </span>
                      )}
                      <time
                        dateTime={notification.createdAt}
                        className="mt-1 block text-xs text-gray-400 dark:text-gray-500"
                      >
                        {formatRelativeTime(notification.createdAt)}
                      </time>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}