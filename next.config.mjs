/** @type {import('next').NextConfig} */

/**
 * CSP sources for Freighter wallet messaging and Stellar network/CDN resources.
 * Freighter communicates via window.postMessage; chrome-extension: covers
 * residual extension fetches. Horizon + Soroban RPC cover on-chain calls.
 */
function resolveApiOrigin() {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    }
  } catch {
    // fall through
  }
  return "http://localhost:3001";
}

const isDev = process.env.NODE_ENV !== "production";
const apiOrigin = resolveApiOrigin();

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js injects inline scripts/styles; 'unsafe-eval' needed for Next.js runtime
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://ipfs.io",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    apiOrigin,
    "http://localhost:3000",
    "http://localhost:3001",
    "ws://localhost:3000",
    "https://*.stellar.org",
    "https://horizon.stellar.org",
    "https://horizon-testnet.stellar.org",
    "https://soroban-rpc.mainnet.stellar.gateway.fm",
    "https://soroban-rpc.testnet.stellar.gateway.fm",
    "https://*.stellar.gateway.fm",
    "https://stellar.expert",
    "https://*.stellar.expert",
    "chrome-extension:",
  ].join(" "),
  "frame-src 'self' chrome-extension:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Avoid breaking local HTTP; enable HSTS-style upgrade only in production
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Only trusted domains are allowed here to prevent SSRF via the image
    // optimization endpoint. Add new domains explicitly as needed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
