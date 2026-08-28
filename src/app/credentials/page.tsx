"use client";

import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { useCredentials } from "@/lib/hooks/use-credentials";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CredentialBadge } from "@/components/credentials/credential-badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Award, Shield } from "lucide-react";

export default function CredentialsPage() {
  const { ready } = useRequireAuth();
  const { credentials, loading } = useCredentials();

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
        <h1 className="text-2xl font-bold text-gray-900">My Credentials</h1>
        <p className="text-gray-500 mt-1">
          Your verifiable on-chain credentials. Share them as proof of your
          skills.
        </p>
      </div>

      {credentials.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Credentials Yet"
          description="Complete courses and pass quizzes to earn verifiable credential NFTs on the Stellar network."
        />
      ) : (
        <>
          {/* Badge showcase */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Credential Badges
            </h2>
            <div className="flex flex-wrap gap-6">
              {credentials.map((cred) => (
                <CredentialBadge
                  key={cred.id}
                  courseTitle={cred.courseTitle}
                  issuedAt={cred.issuedAt}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Credential List */}
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            All Credentials
          </h2>
          <div className="space-y-3">
            {credentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
