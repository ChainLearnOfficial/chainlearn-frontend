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

  const fetchCredentials = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCredentials(jwt);
      setCredentials(data);
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  const mint = useCallback(
    async (courseId: string) => {
      if (!jwt) throw new Error("Not authenticated");
      const credential = await mintCredential(courseId, jwt);
      setCredentials((prev) => [credential, ...prev]);
      return credential;
    },
    [jwt]
  );

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return { credentials, loading, mint, refetch: fetchCredentials };
}

export function useCredentialDetail(credentialId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [credential, setCredential] = useState<CredentialNFT | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!credentialId) return;
    setLoading(true);
    getCredential(credentialId, jwt ?? undefined)
      .then(setCredential)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [credentialId, jwt]);

  return { credential, loading };
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
