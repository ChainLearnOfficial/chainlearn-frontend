"use client";

import { useState, useEffect } from "react";

/**
 * Fetch a live USD price for a token from Stellar Index's public pricing API
 * (https://api.stellarindex.io). The quote asset is USD so the returned value
 * is already a USD-equivalent.
 *
 * Falls back to a configurable static rate (via NEXT_PUBLIC_FALLBACK_TOKEN_USD)
 * when the network call fails so the UI always has a value to render.
 */
async function fetchTokenUsdRate(
  code: string,
  issuer?: string
): Promise<number | null> {
  try {
    const asset = issuer ? `${code}-${issuer}` : code;
    const res = await fetch(
      `https://api.stellarindex.io/v1/price?asset=${encodeURIComponent(
        asset
      )}&quote=fiat:USD`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { price?: number | string };
    };
    if (data?.data?.price === undefined) return null;
    const parsed = parseFloat(String(data.data.price));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function fallbackUsdRate(): number | null {
  const raw = process.env.NEXT_PUBLIC_FALLBACK_TOKEN_USD;
  if (!raw) return null;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export interface UseTokenPriceResult {
  usdRate: number | null;
  usdLoading: boolean;
  error: boolean;
}

export function useTokenPrice(
  code: string,
  issuer?: string,
  nonce = 0
): UseTokenPriceResult {
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [usdLoading, setUsdLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setUsdLoading(true);
    setError(false);

    fetchTokenUsdRate(code, issuer)
      .catch(() => null)
      .then((rate) => {
        if (!active) return;
        const resolved = rate ?? fallbackUsdRate();
        setUsdRate(resolved);
        setError(rate === null);
        setUsdLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code, issuer, nonce]);

  return { usdRate, usdLoading, error };
}
