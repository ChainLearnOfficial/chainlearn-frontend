"use client";

import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";

interface ClaimButtonProps {
  claimableId: string;
  amount: string;
  sourceTitle: string;
  onClaim: (claimableId: string) => Promise<unknown>;
  className?: string;
}

export function ClaimButton({
  claimableId,
  amount,
  sourceTitle,
  onClaim,
  className,
}: ClaimButtonProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim(claimableId);
      setClaimed(true);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setClaiming(false);
    }
  };

  if (claimed) {
    return (
      <Button variant="ghost" disabled className={className}>
        Claimed!
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClaim}
      disabled={claiming}
      className={className}
      size="sm"
    >
      {claiming ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          Claiming...
        </>
      ) : (
        <>
          <Gift className="h-4 w-4 mr-1" />
          Claim {amount} LEARN
        </>
      )}
    </Button>
  );
}
