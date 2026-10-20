import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders fallback initials", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-14"],
  ] as const)("size=%s applies correct class", (size, cls) => {
    const { container } = render(
      <Avatar size={size}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect((container.firstChild as HTMLElement).className).toContain(cls);
  });

  it("merges custom className", () => {
    const { container } = render(
      <Avatar className="custom-class">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLSpanElement>;
    render(
      <Avatar ref={ref}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(ref.current).not.toBeNull();
  });

  it("renders AvatarImage element when provided", () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="User avatar" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    // jsdom won't actually load the image, so the fallback still renders,
    // but the component tree should not throw when an image is supplied.
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

describe("getInitials", () => {
  it("returns first two letters for a single word", () => {
    expect(getInitials("GABC123XYZ")).toBe("GA");
  });

  it("returns first letters of first and last name", () => {
    expect(getInitials("Jane Doe")).toBe("JD");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });
});
