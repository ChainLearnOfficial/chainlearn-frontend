"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getSessions, revokeSession } from "@/lib/api/auth";
import { isAbortError } from "@/lib/api/client";
import type { UserSession } from "@/types/api";

/**
 * Hook for managing user authentication sessions.
 * Provides functionality to list active sessions and revoke individual sessions.
 */
export function useSessions() {
  const jwt = useAuthStore((s) => s.jwt);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      const data = await getSessions(jwt, controller.signal);
      setSessions(data || []);
    } catch (err) {
      if (isAbortError(err)) return;
      
      // Fallback to current session if endpoint is not available
      const fallbackSession: UserSession = {
        id: "current-session",
        device: "Current Device",
        browser: typeof navigator !== "undefined" ? navigator.userAgent.split(" ")[0] : "Browser",
        os: "Web",
        lastActive: "Just now",
        createdAt: new Date().toISOString(),
        isCurrent: true,
      };
      
      setSessions([fallbackSession]);
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [jwt]);

  const revoke = useCallback(
    async (sessionId: string) => {
      if (!jwt) throw new Error("Not authenticated");

      setRevokingId(sessionId);
      setError(null);

      try {
        await revokeSession(jwt, sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to revoke session";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setRevokingId(null);
      }
    },
    [jwt]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    revokingId,
    fetchSessions,
    revoke,
  };
}
