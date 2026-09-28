"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Shield, Loader2, AlertCircle } from "lucide-react";
import { isFreighterInstalled } from "@/lib/stellar/wallet";
import { useEffect, useRef, useState } from "react";
import { useToastContext } from "@/components/shared/toast";

/**
 * ConnectPage component handles the Freighter wallet connection flow.
 * Checks for Freighter installation, initiates connection, signs a challenge,
 * and redirects to onboarding or dashboard upon success.
 */
export default function ConnectPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isConnecting,
    connectionStage,
    connectWallet,
    error,
    walletError,
  } = useAuth();
  const { addToast } = useToastContext();
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(
    null
  );
  const connectingFromPage = useRef(false);

  useEffect(() => {
    let active = true;
    isFreighterInstalled().then((installed) => {
      if (active) setFreighterInstalled(installed);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || connectingFromPage.current) return;
    let active = true;
    const redirect = async () => {
      try {
        const { getProfile } = await import("@/lib/api/auth");
        const { useAuthStore } = await import("@/store/auth-store");
        const jwt = useAuthStore.getState().jwt;
        const profile = jwt ? await getProfile(jwt) : null;
        if (active) {
          router.replace(profile?.displayName ? "/dashboard" : "/onboarding");
        }
      } catch {
        if (active) router.replace("/onboarding");
      }
    };
    void redirect();
    return () => {
      active = false;
    };
  }, [isAuthenticated, router]);

  const handleConnect = async () => {
    connectingFromPage.current = true;
    try {
      await connectWallet();
    } catch {
      connectingFromPage.current = false;
      return;
    }

    addToast("Wallet connected successfully!", "success");
    try {
      const { getProfile } = await import("@/lib/api/auth");
      const { useAuthStore } = await import("@/store/auth-store");
      const jwt = useAuthStore.getState().jwt;
      const profile = jwt ? await getProfile(jwt) : null;
      router.replace(profile?.displayName ? "/dashboard" : "/onboarding");
    } catch {
      addToast("Wallet connected, but your profile could not be loaded. Continue setup to get started.", "error");
      router.replace("/onboarding");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stellar-purple/10">
            <Wallet className="h-8 w-8 text-stellar-purple" />
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription>
            Link your Stellar wallet to start learning and earning rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {freighterInstalled === false && (
            <div className="flex items-start gap-3 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Freighter Not Detected
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Please install the{" "}
                  <a
                    href="https://freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Freighter wallet extension
                  </a>{" "}
                  to continue.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p>{walletError?.message ?? error}</p>
                {walletError?.resolution && (
                  <p className="mt-1 text-xs">{walletError.resolution}</p>
                )}
              </div>
            </div>
          )}

          <ol aria-label="Wallet connection steps" className="space-y-2">
            {[
              ["detect", "Detect Freighter"],
              ["connect", "Connect wallet"],
              ["sign", "Sign challenge"],
              ["verify", "Verify connection"],
            ].map(([stage, label], index) => {
              const stages = ["detect", "connect", "sign", "verify"];
              const activeIndex = stages.indexOf(connectionStage);
              const active = connectionStage === stage;
              const complete =
                connectionStage === "complete" ||
                (activeIndex >= 0 && index < activeIndex);
              return (
                <li
                  key={stage}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2 text-sm ${
                    active ? "font-medium text-primary-700" : "text-gray-500"
                  }`}
                >
                  {active && isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="h-4 w-4 text-center" aria-hidden="true">
                      {complete ? "✓" : "·"}
                    </span>
                  )}
                  {label}
                </li>
              );
            })}
          </ol>

          <Button
            onClick={handleConnect}
            disabled={isConnecting || freighterInstalled === false}
            className="w-full gap-2"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                Connect with Freighter
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
            <Shield className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              Your wallet keys never leave your browser. We only use your public
              address for authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
