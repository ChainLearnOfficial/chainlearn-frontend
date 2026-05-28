"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { truncateAddress } from "@/lib/utils/format";
import { useState } from "react";

export function ConnectButton() {
  const { isAuthenticated, walletAddress, isConnecting, connectWallet, disconnect } =
    useAuth();
  const [showDisconnect, setShowDisconnect] = useState(false);

  if (isAuthenticated && walletAddress) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDisconnect(!showDisconnect)}
          className="gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {truncateAddress(walletAddress)}
        </Button>

        {showDisconnect && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
            <button
              onClick={() => {
                disconnect();
                setShowDisconnect(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      size="sm"
      className="gap-2"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
