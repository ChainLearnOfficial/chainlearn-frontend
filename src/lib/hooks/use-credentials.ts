"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  getCredentials,
  getCredential,
  verifyCredential,
  mintCredential,
} from "@/lib/api/credentials";
import type { CredentialNFT, CredentialMetadata } from "@/types/stellar";

export function useCredentials() {
  const jwt = useAuthStore((s) => s.jwt);
  const [credentials, setCredentials] = useState<CredentialNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCredentials(jwt);
      setCredentials(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch credentials";
      setError(message);
      console.error("Failed to fetch credentials:", err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  const mint = useCallback(
    async (courseId: string) => {
      if (!jwt) throw new Error("Not authenticated");
      setError(null);
      try {
        const credential = await mintCredential(courseId, jwt);
        setCredentials((prev) => [credential, ...prev]);
        return credential;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to mint credential";
        setError(message);
        throw err;
      }
    },
    [jwt]
  );

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return { credentials, loading, error, mint, refetch: fetchCredentials };
}

export function useCredentialDetail(credentialId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [credential, setCredential] = useState<CredentialNFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!credentialId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCredential(credentialId, jwt ?? undefined)
      .then(setCredential)
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load credential";
        setError(message);
        console.error(message, err);
      })
      .finally(() => setLoading(false));
  }, [credentialId, jwt]);

  return { credential, loading, error };
}

export function useVerifyCredential(credentialId: string) {
  const [verification, setVerification] = useState<{
    valid: boolean;
    metadata: CredentialMetadata;
    verifiedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!credentialId) return;
    setLoading(true);
    verifyCredential(credentialId)
      .then(setVerification)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Verification failed"
        )
      )
      .finally(() => setLoading(false));
  }, [credentialId]);

  return { verification, loading, error };
}
