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
    const title = `${credential.courseTitle} - Credential`;
    const description = `On-chain credential for ${credential.courseTitle} on ChainLearn.`;

    return {
      title,
      description,
      openGraph: {
        title: `${credential.courseTitle} Credential | ChainLearn`,
        description,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${credential.courseTitle} Credential | ChainLearn`,
        description,
      },
    };
  } catch {
    return {
      title: "Credential",
      description: "View credential details on ChainLearn.",
      openGraph: {
        title: "Credential | ChainLearn",
        description: "View credential details on ChainLearn.",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Credential | ChainLearn",
        description: "View credential details on ChainLearn.",
      },
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
