"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { truncateAddress } from "@/lib/utils/format";
import { useState, useRef, useEffect, useCallback } from "react";

export function ConnectButton() {
  const { isAuthenticated, walletAddress, isConnecting, connectWallet, disconnect } =
    useAuth();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const disconnectButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback(() => {
    setShowDisconnect(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showDisconnect) return;

    disconnectButtonRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = dropdownRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDisconnect, closeDropdown]);

  if (isAuthenticated && walletAddress) {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          onClick={() => setShowDisconnect(!showDisconnect)}
          aria-expanded={showDisconnect}
          aria-haspopup="true"
          className="gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {truncateAddress(walletAddress)}
        </Button>

        {showDisconnect && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50" role="menu">
            <button
              ref={disconnectButtonRef}
              onClick={() => {
                disconnect();
                closeDropdown();
              }}
              role="menuitem"
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
