"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2, Copy, Check, Globe, RefreshCw } from "lucide-react";
import { truncateAddress } from "@/lib/utils/format";
import { useState, useRef, useEffect, useCallback } from "react";

export function ConnectButton() {
  const { isAuthenticated, walletAddress, isConnecting, connectWallet, disconnect } =
    useAuth();
  const { network, setNetwork } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDropdown, closeDropdown]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleNetwork = () => {
    const nextNetwork = network === "testnet" ? "public" : "testnet";
    setNetwork(nextNetwork);
  };

  if (isAuthenticated && walletAddress) {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="true"
          className="gap-2 font-mono"
        >
          <span className="flex items-center gap-1.5 font-sans text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Freighter</span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-stellar-purple px-1.5 py-0.5 rounded bg-stellar-purple/10">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {network}
            </span>
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {truncateAddress(walletAddress)}
          </span>
        </Button>

        {showDropdown && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-50 dark:border-gray-800 dark:bg-gray-900"
            role="menu"
          >
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-400 font-medium">Connected Wallet</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                <span>Freighter Wallet</span>
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-mono font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs font-mono text-gray-500 truncate mt-0.5">
                {walletAddress}
              </div>
            </div>

            <div className="py-1 space-y-0.5">
              <button
                type="button"
                onClick={handleCopyAddress}
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-gray-500" />
                  Copy Address
                </span>
                {copied ? (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Copied
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={handleToggleNetwork}
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  Switch Network
                </span>
                <span className="text-xs font-bold uppercase text-stellar-purple flex items-center gap-1">
                  {network} <RefreshCw className="h-3 w-3" />
                </span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  closeDropdown();
                }}
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </button>
            </div>
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
      className="gap-2 font-medium"
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
