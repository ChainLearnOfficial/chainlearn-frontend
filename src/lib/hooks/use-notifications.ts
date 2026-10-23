"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import { isAbortError } from "@/lib/api/client";
import type { AppNotification } from "@/types/notification";

export function useNotifications() {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    const token = jwtRef.current;
    if (!token) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const items = await getNotifications(token, controller.signal);
      setNotifications(items);
    } catch (e) {
      if (isAbortError(e)) return;
      
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
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
      
      refetch();
    }
  }, [refetch]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch, jwt]);

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