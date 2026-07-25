import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";

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
    const title = `Verify - ${data.metadata.courseTitle}`;
    const description = `On-chain verification of ${data.metadata.courseTitle} credential on ChainLearn.`;

    return {
      title,
      description,
      openGraph: {
        title: `Verify ${data.metadata.courseTitle} | ChainLearn`,
        description,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `Verify ${data.metadata.courseTitle} | ChainLearn`,
        description,
      },
    };
  } catch {
    return {
      title: "Verify Credential",
      description: "Verify an on-chain credential on ChainLearn.",
      openGraph: {
        title: "Verify Credential | ChainLearn",
        description: "Verify an on-chain credential on ChainLearn.",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Verify Credential | ChainLearn",
        description: "Verify an on-chain credential on ChainLearn.",
      },
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
