import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CredentialCard } from "@/components/credentials/credential-card";
import type { CredentialNFT } from "@/types/stellar";

const mockCredential: CredentialNFT = {
  id: "cred-1",
  tokenId: "1",
  contractAddress: "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  courseId: "c1",
  courseTitle: "Soroban Development",
  issuedAt: "2024-06-15T00:00:00Z",
  metadata: {
    learnerAddress: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    courseTitle: "Soroban Development",
    completionDate: "2024-06-15T00:00:00Z",
    skills: ["Rust", "Soroban", "Stellar"],
    issuerAddress: "GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
    verificationUrl: "https://example.com/verify/cred-1",
  },
};

describe("CredentialCard", () => {
  it("renders credential title and skills", () => {
    render(<CredentialCard credential={mockCredential} />);
    expect(screen.getByText("Soroban Development")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("Soroban")).toBeInTheDocument();
  });

  it("links to credential detail page", () => {
    render(<CredentialCard credential={mockCredential} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/credentials/cred-1"
    );
  });
});
