import { createOgImage, OG_SIZE } from "@/lib/utils/og-image";

export const alt = "ChainLearn credential verification";
export const size = OG_SIZE;
export const contentType = "image/png";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ImageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { credentialId } = await params;
  let title = "Verify Credential";
  let description =
    "Verify an on-chain credential issued through ChainLearn on Stellar.";

  try {
    const response = await fetch(
      `${API_URL}/credentials/${credentialId}/verify`,
      { next: { revalidate: 3600 } }
    );
    if (response.ok) {
      const payload = (await response.json()) as {
        data?: { metadata: { courseTitle: string } };
        metadata?: { courseTitle: string };
      };
      const metadata = payload.data?.metadata ?? payload.metadata;
      if (metadata?.courseTitle) {
        title = `Verify ${metadata.courseTitle}`;
        description = `On-chain verification of ${metadata.courseTitle} credential on ChainLearn.`;
      }
    }
  } catch {
    // Fall back to generic verify copy when lookup fails.
  }

  return createOgImage({
    eyebrow: "ChainLearn · Verify",
    title,
    description,
  });
}
