import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";

// Override usePathname from setup.ts per-test
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
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /credentials/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /rewards/i })).toBeInTheDocument();
  });

  it("marks the active link with primary styling", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);
    const dashLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashLink.className).toContain("bg-primary-100");
  });

  it("does not mark inactive links as active", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);
    const coursesLink = screen.getByRole("link", { name: /courses/i });
    expect(coursesLink.className).not.toContain("bg-primary-100");
  });
});
