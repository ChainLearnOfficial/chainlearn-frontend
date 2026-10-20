"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, CheckCircle, XCircle } from "lucide-react";

interface RewardClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  sourceTitle: string;
  onConfirm: () => Promise<void>;
}

type ClaimStatus = "idle" | "submitting" | "success" | "error";

export function RewardClaimDialog({
  open,
  onOpenChange,
  amount,
  sourceTitle,
  onConfirm,
}: RewardClaimDialogProps) {
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setStatus("submitting");
    setErrorMessage("");
    try {
      await onConfirm();
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Claim failed. Please try again."
      );
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Reward</DialogTitle>
          <DialogDescription>
            Confirm you want to claim this reward. This will initiate an
            on-chain transaction.
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-gray-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reward</span>
                <span className="font-medium text-gray-900">
                  {amount} LEARN
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Source</span>
                <span className="text-gray-700">{sourceTitle}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Network fee</span>
                <span className="text-gray-700">~0.00001 XLM</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              This transaction is irreversible. Please verify the details above
              before confirming.
            </p>
          </div>
        )}

        {status === "submitting" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-600">Submitting transaction...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Reward claimed successfully!
            </p>
            <p className="text-xs text-gray-500">
              +{amount} LEARN tokens have been sent to your wallet.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </div>
        )}

        <DialogFooter>
          {status === "idle" && (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirm}>
                <Gift className="h-4 w-4 mr-1" />
                Confirm Claim
              </Button>
            </>
          )}
          {status === "submitting" && (
            <DialogClose asChild>
              <Button variant="outline" disabled>
                Cancel
              </Button>
            </DialogClose>
          )}
          {(status === "success" || status === "error") && (
            <DialogClose asChild>
              <Button onClick={handleClose}>
                {status === "success" ? "Done" : "Try Again"}
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
