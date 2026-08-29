"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import type { AppNotification } from "@/types/notification";

export function useNotifications() {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const token = jwtRef.current;
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await getNotifications(token);
      setNotifications(items);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      const token = jwtRef.current;
      if (!token) return;
      // Optimistically mark local state before the server round-trips.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      try {
        await markNotificationAsRead(id, token);
      } catch (e) {
        console.error("Failed to mark notification as read:", e);
        // Revert so the unread state stays accurate if the request fails.
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    const token = jwtRef.current;
    if (!token) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsAsRead(token);
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
      refetch();
    }
  }, [refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}