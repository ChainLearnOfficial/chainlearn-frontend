"use client";

import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useState } from "react";
import { RewardClaimDialog } from "./reward-claim-dialog"; // Reward claim dialog wrapper

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleConfirm = async () => {
    await onClaim(claimableId);
    setClaimed(true);
  };

  if (claimed) {
    return (
      <Button variant="ghost" disabled className={className}>
        Claimed!
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className={className}
        size="sm"
      >
        <Gift className="h-4 w-4 mr-1" />
        Claim {amount} LEARN
      </Button>

      <RewardClaimDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        amount={amount}
        sourceTitle={sourceTitle}
        onConfirm={handleConfirm}
      />
    </>
  );
}
