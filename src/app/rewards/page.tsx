"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useRewards } from "@/lib/hooks/use-rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenBalance } from "@/components/rewards/token-balance";
import { ClaimButton } from "@/components/rewards/claim-button";
import { RewardHistory } from "@/components/rewards/reward-history";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Gift, Coins, TrendingUp } from "lucide-react";

export default function RewardsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { balances, history, claimables, loading, claim, claiming } =
    useRewards();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/connect");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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
          <Card>
            <CardContent className="py-8 text-center">
              <Coins className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No tokens yet. Complete courses to earn LEARN tokens.
              </p>
            </CardContent>
          </Card>
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
                    onClaim={claim}
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
            <RewardHistory claims={history} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
