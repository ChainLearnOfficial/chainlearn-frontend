import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CredentialCard } from "@/components/credentials/credential-card";
import type { CredentialNFT } from "@/types/stellar";

const credential: CredentialNFT = {
  id: "cred-1",
  tokenId: "42",
  contractAddress: "CXXX",
  courseId: "course-1",
  courseTitle: "Stellar Smart Contracts",
  issuedAt: "2024-03-15T00:00:00Z",
  metadata: {
    learnerAddress: "GABC",
    courseTitle: "Stellar Smart Contracts",
    completionDate: "2024-03-15",
    score: 95,
    skills: ["Soroban", "Rust", "Stellar"],
    issuerAddress: "GISS",
    verificationUrl: "https://stellar.expert/verify/cred-1",
  },
};

describe("CredentialCard", () => {
  it("renders the course title", () => {
    render(<CredentialCard credential={credential} />);
    expect(screen.getByText("Stellar Smart Contracts")).toBeInTheDocument();
  });

  it("renders the issued date", () => {
    render(<CredentialCard credential={credential} />);
    // formatDate("2024-03-15T00:00:00Z") → "Mar 15, 2024"
    expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument();
  });

  it("renders up to 3 skill tags", () => {
    render(<CredentialCard credential={credential} />);
    expect(screen.getByText("Soroban")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("Stellar")).toBeInTheDocument();
  });

  it("shows at most 3 skill tags even with more skills", () => {
    const extra: CredentialNFT = {
      ...credential,
      metadata: {
        ...credential.metadata,
        skills: ["A", "B", "C", "D", "E"],
      },
    };
    render(<CredentialCard credential={extra} />);
    expect(screen.queryByText("D")).not.toBeInTheDocument();
    expect(screen.queryByText("E")).not.toBeInTheDocument();
  });

  it("links to the credential detail page", () => {
    render(<CredentialCard credential={credential} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/credentials/cred-1");
  });

  it("renders no skill tags when skills array is empty", () => {
    const noSkills: CredentialNFT = {
      ...credential,
      metadata: { ...credential.metadata, skills: [] },
    };
    const { container } = render(<CredentialCard credential={noSkills} />);
    // flex flex-wrap gap-1 mt-2 wrapper should not exist
    expect(container.querySelector(".flex.flex-wrap")).not.toBeInTheDocument();
  });
});
