"use client";

import { use } from "react";
import { useVerifyCredential } from "@/lib/hooks/use-credentials";
import { CredentialBadge } from "@/components/credentials/credential-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { formatDate, truncateAddress } from "@/lib/utils/format";
import {
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Award,
} from "lucide-react";

export default function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = use(params);
  const { verification, loading, error } = useVerifyCredential(credentialId);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <Shield className="mx-auto h-12 w-12 text-stellar-purple mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">
          Credential Verification
        </h1>
        <p className="text-gray-500 mt-1">
          On-chain verification of ChainLearn credentials.
        </p>
      </div>

      {error || !verification ? (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-500">
              {error || "Unable to verify this credential."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CredentialBadge
                courseTitle={verification.metadata.courseTitle}
                issuedAt={verification.metadata.completionDate}
                verified={verification.valid}
                size="md"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              {verification.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-green-700">
                    Verified Credential
                  </CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-700">
                    Invalid Credential
                  </CardTitle>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Course</p>
                  <p className="font-medium">
                    {verification.metadata.courseTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium">
                    {formatDate(verification.metadata.completionDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Learner:</span>
                <span className="font-mono text-xs">
                  {truncateAddress(verification.metadata.learnerAddress, 8)}
                </span>
              </div>
            </div>

            {verification.metadata.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Skills Demonstrated
                </p>
                <div className="flex flex-wrap gap-2">
                  {verification.metadata.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {verification.metadata.score !== undefined && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <Award className="mx-auto h-5 w-5 text-green-600 mb-1" />
                <p className="text-sm font-medium text-green-700">
                  Score: {verification.metadata.score}%
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-2">
              Verified at {formatDate(verification.verifiedAt)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
