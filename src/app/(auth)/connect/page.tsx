"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { isFreighterInstalled } from "@/lib/stellar/wallet";
import { useEffect, useState } from "react";
import { useToastContext } from "@/components/shared/toast";

export default function ConnectPage() {
  const router = useRouter();
  const { isAuthenticated, isConnecting, connectWallet, error } = useAuth();
  const { addToast } = useToastContext();
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    isFreighterInstalled().then(setFreighterInstalled);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleConnect = async () => {
    try {
      await connectWallet();
      addToast("Wallet connected successfully!", "success");
      router.push("/onboarding");
    } catch {
      addToast("Failed to connect wallet. Please try again.", "error");
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
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
