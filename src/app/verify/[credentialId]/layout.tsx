import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import type { CredentialNFT } from "@/types/stellar";

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { credentialId } = await params;

  try {
    const response = await apiClient.get<{
      valid: boolean;
      metadata: { courseTitle: string };
    }>(`/credentials/${credentialId}/verify`);
    const data = response.data;

    return {
      title: `Verify - ${data.metadata.courseTitle}`,
      description: `On-chain verification of ${data.metadata.courseTitle} credential on ChainLearn.`,
      openGraph: {
        title: `Verify ${data.metadata.courseTitle} | ChainLearn`,
        description: `On-chain verification of ${data.metadata.courseTitle} credential on ChainLearn.`,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Verify Credential",
      description: "Verify an on-chain credential on ChainLearn.",
    };
  }
}

export default async function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
