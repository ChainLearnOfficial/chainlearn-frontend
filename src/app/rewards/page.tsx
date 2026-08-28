"use client";

import { lazy, Suspense } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { useRewards } from "@/lib/hooks/use-rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenBalance } from "@/components/rewards/token-balance";
import { ClaimButton } from "@/components/rewards/claim-button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useToastContext } from "@/components/shared/toast";
import { Gift, Coins, TrendingUp } from "lucide-react";

// Deferred so the (potentially long) claim history list streams in after
// balances and claimables have rendered.
const RewardHistory = lazy(() =>
  import("@/components/rewards/reward-history").then((m) => ({
    default: m.RewardHistory,
  }))
);

export default function RewardsPage() {
  const { ready } = useRequireAuth();
  const { balances, history, claimables, loading, claim, claiming } =
    useRewards();
  const { addToast } = useToastContext();

  const handleClaim = async (claimableId: string) => {
    try {
      await claim(claimableId);
      addToast("Reward claimed successfully!", "success");
    } catch (err) {
      addToast("Failed to claim reward. Please try again.", "error");
      throw err;
    }
  };

  if (!ready) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500 mt-1">
          Track your token balance and claim pending rewards.
        </p>
      </div>

      {/* Token Balances */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {balances.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Coins}
              title="No Tokens Yet"
              description="Complete courses to earn LEARN tokens."
            />
          </div>
        ) : (
          balances.map((balance) => (
            <TokenBalance key={balance.tokenCode} balance={balance} />
          ))
        )}
      </div>

      {/* Claimable Rewards */}
      {claimables.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-stellar-purple" />
            Claimable Rewards
          </h2>
          <div className="space-y-3">
            {claimables.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.sourceTitle}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.source}
                    </p>
                  </div>
                  <ClaimButton
                    claimableId={item.id}
                    amount={item.amount}
                    sourceTitle={item.sourceTitle}
                    onClaim={handleClaim}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-stellar-purple" />
          Claim History
        </h2>
        <Card>
          <CardContent className="p-4">
            <Suspense fallback={<LoadingSkeleton count={3} variant="text" />}>
              <RewardHistory claims={history} />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
