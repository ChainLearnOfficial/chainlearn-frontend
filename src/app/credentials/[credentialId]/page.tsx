"use client";

import { use } from "react";
import { useCredentialDetail } from "@/lib/hooks/use-credentials";
import { CredentialBadge } from "@/components/credentials/credential-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { formatDate, truncateAddress } from "@/lib/utils/format";
import {
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = use(params);
  const { credential, loading } = useCredentialDetail(credentialId);
  const [copied, setCopied] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-500">Credential not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Badge */}
      <div className="flex justify-center mb-8">
        <CredentialBadge
          courseTitle={credential.courseTitle}
          issuedAt={credential.issuedAt}
          size="lg"
          verified
        />
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{credential.courseTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Issued</p>
                <p className="font-medium">
                  {formatDate(credential.issuedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Token ID</p>
                <p className="font-mono text-xs">
                  {truncateAddress(credential.tokenId, 6)}
                </p>
              </div>
            </div>
          </div>

          {/* Learner Address */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Learner</span>
              </div>
              <button
                onClick={() =>
                  copyAddress(credential.metadata.learnerAddress)
                }
                className="flex items-center gap-1 text-xs font-mono text-gray-600 hover:text-gray-900"
              >
                {truncateAddress(credential.metadata.learnerAddress, 6)}
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Skills */}
          {credential.metadata.skills.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Skills Demonstrated</p>
              <div className="flex flex-wrap gap-2">
                {credential.metadata.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Link */}
          <div className="pt-4 border-t border-gray-200">
            <a
              href={`/verify/${credentialId}`}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Share Verification Link
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
