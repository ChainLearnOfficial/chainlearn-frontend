import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import type { CredentialNFT } from "@/types/stellar";

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { credentialId } = await params;

  try {
    const response = await apiClient.get<CredentialNFT>(
      `/credentials/${credentialId}`
    );
    const credential = response.data;

    return {
      title: `${credential.courseTitle} - Credential`,
      description: `On-chain credential for ${credential.courseTitle} on ChainLearn.`,
      openGraph: {
        title: `${credential.courseTitle} Credential | ChainLearn`,
        description: `On-chain credential for ${credential.courseTitle} on ChainLearn.`,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Credential",
      description: "View credential details on ChainLearn.",
    };
  }
}

export default async function CredentialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
