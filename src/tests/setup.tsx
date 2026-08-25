import "@testing-library/jest-dom";

// Suppress Next.js router / Link warnings in jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Silence console.error noise from intentional throws in error-boundary tests
const originalError = console.error.bind(console.error);
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    if (
      msg.includes("ErrorBoundary caught") ||
      msg.includes("The above error occurred") ||
      msg.includes("act(") ||
      msg.includes("Route error:")
    )
      return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
