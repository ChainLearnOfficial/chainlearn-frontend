import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator", () => {
  it("renders as horizontal by default", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-orientation")).toBe("horizontal");
    expect(el.className).toContain("h-px");
    expect(el.className).toContain("w-full");
  });

  it("renders as vertical when specified", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-orientation")).toBe("vertical");
    expect(el.className).toContain("h-full");
    expect(el.className).toContain("w-px");
  });

  it("is decorative by default (aria-hidden)", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).not.toBe("separator");
  });

  it("exposes ARIA separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("separator");
  });

  it("merges custom className", () => {
    const { container } = render(<Separator className="my-class" />);
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
