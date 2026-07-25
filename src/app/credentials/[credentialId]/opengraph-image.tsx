import { createOgImage, OG_SIZE } from "@/lib/utils/og-image";
import type { CredentialNFT } from "@/types/stellar";

export const alt = "ChainLearn credential";
export const size = OG_SIZE;
export const contentType = "image/png";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ImageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { credentialId } = await params;
  let title = "Credential on ChainLearn";
  let description = "On-chain verifiable credential issued on the Stellar network.";

  try {
    const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const payload = (await response.json()) as {
        data?: CredentialNFT;
      } & CredentialNFT;
      const credential = payload.data ?? payload;
      title = `${credential.courseTitle} Credential`;
      description = `On-chain credential for ${credential.courseTitle} on ChainLearn.`;
    }
  } catch {
    // Fall back to generic credential copy when lookup fails.
  }

  return createOgImage({
    eyebrow: "ChainLearn · Credential",
    title,
    description,
  });
}
