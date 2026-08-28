"use client";

import Link from "next/link";
import { useCredentialDetail } from "@/lib/hooks/use-credentials";
import { CredentialBadge } from "@/components/credentials/credential-badge";
import { QrCode } from "@/components/credentials/qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { formatDate, truncateAddress } from "@/lib/utils/format";
import {
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Copy,
  CheckCircle,
  Download,
  ShieldCheck,
} from "lucide-react";
import { useState, useCallback } from "react";

export default function CredentialDetailPage({
  params,
}: {
  params: { credentialId: string };
}) {
  const { credentialId } = params;
  const { credential, loading, error } = useCredentialDetail(credentialId);
  const [copied, setCopied] = useState(false);

  const verificationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${credentialId}`
    : "";

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
    }
  };

  const handleDownload = useCallback(() => {
    if (!credential) return;
    const html = `<!DOCTYPE html>
<html><head><title>Certificate - ${credential.courseTitle}</title>
<style>
  body{font-family:Georgia,serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}
  .cert{background:white;border:2px solid #111;padding:48px;max-width:640px;text-align:center}
  .cert h1{font-size:28px;margin:0 0 8px}.cert h2{font-size:18px;font-weight:normal;color:#555;margin:0 0 24px}
  .cert .line{border-top:1px solid #ddd;margin:16px 0}.cert .meta{font-size:13px;color:#666}
</style></head><body>
<div class="cert">
  <h1>Certificate of Completion</h1>
  <h2>${credential.courseTitle}</h2>
  <div class="line"></div>
  <p class="meta">Issued: ${formatDate(credential.issuedAt)}</p>
  <p class="meta">Credential ID: ${credential.id}</p>
  <p class="meta">Token: ${truncateAddress(credential.tokenId, 8)}</p>
  ${credential.metadata.score ? `<p class="meta">Score: ${credential.metadata.score}%</p>` : ""}
  <div class="line"></div>
  <p class="meta">Verified on Stellar blockchain</p>
</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${credential.courseTitle.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [credential]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p role="alert" aria-live="polite" className="text-gray-500">
          {error || "Credential not found."}
        </p>
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

          {/* On-chain Verification */}
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-green-700">On-Chain Verified</p>
                <p className="text-xs text-green-600 font-mono">
                  Contract: {truncateAddress(credential.contractAddress, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {credential.metadata.skills.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Skills Demonstrated</p>
              <div className="flex flex-wrap gap-2">
                {credential.metadata.skills.map((skill) => (
                  <Badge key={skill}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {verificationUrl && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-sm text-gray-500">Scan to verify</p>
              <QrCode value={verificationUrl} size={140} />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
            <Link
              href={`/verify/${credentialId}`}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Share Verification Link
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
