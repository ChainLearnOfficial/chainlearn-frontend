import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CredentialBadge } from "@/components/credentials/credential-badge";

describe("CredentialBadge", () => {
  const defaultProps = {
    courseTitle: "Stellar Developer",
    issuedAt: "2024-06-01T00:00:00Z",
  };

  it("renders the course title", () => {
    render(<CredentialBadge {...defaultProps} />);
    expect(screen.getByText("Stellar Developer")).toBeInTheDocument();
  });

  it("does not show verified checkmark by default", () => {
    const { container } = render(<CredentialBadge {...defaultProps} />);
    // CheckCircle icon only appears when verified=true
    expect(container.querySelector(".text-white")).not.toBeInTheDocument();
  });

  it("shows verified indicator when verified=true", () => {
    const { container } = render(
      <CredentialBadge {...defaultProps} verified />
    );
    // The verified badge container has bg-green-500
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });

  it.each([
    ["sm", "w-20"],
    ["md", "w-32"],
    ["lg", "w-48"],
  ] as const)("size=%s applies correct width", (size, cls) => {
    const { container } = render(
      <CredentialBadge {...defaultProps} size={size} />
    );
    expect((container.firstChild as HTMLElement).className).toContain(cls);
  });

  it("merges custom className", () => {
    const { container } = render(
      <CredentialBadge {...defaultProps} className="extra" />
    );
    expect((container.firstChild as HTMLElement).className).toContain("extra");
  });
});
