import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuthStore } from "@/store/auth-store";
import { MobileNav } from "@/components/layout/mobile-nav";

const mockUsePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Nav", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: true, hasHydrated: true });
  });

  it("renders all nav links", () => {
    render(<MobileNav />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /credentials/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /rewards/i })).toBeInTheDocument();
  });

  it("applies active color class to the current path link", () => {
    mockUsePathname.mockReturnValue("/rewards");
    render(<MobileNav />);
    const rewardsLink = screen.getByRole("link", { name: /rewards/i });
    expect(rewardsLink.className).toContain("text-primary-600");
  });

  it("applies inactive color class to non-current links", () => {
    mockUsePathname.mockReturnValue("/rewards");
    render(<MobileNav />);
    const dashLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashLink.className).toContain("text-gray-500");
  });

  it("is fixed at the bottom of the viewport", () => {
    const { container } = render(<MobileNav />);
    const nav = container.firstChild as HTMLElement;
    expect(nav.className).toContain("fixed");
    expect(nav.className).toContain("bottom-0");
  });
});
