/** @type {import('next').NextConfig} */
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
        // Apply security headers to every route.
        source: "/:path*",
        headers: [
          // ---------------------------------------------------------------
          // Content-Security-Policy
          // Allows:
          //   - self for all standard resource types
          //   - Freighter wallet extension (chrome-extension: + moz-extension:)
          //   - Stellar IPFS gateway (ipfs.io) for credential images
          //   - Soroban RPC endpoints (testnet + mainnet) for connect-src
          //   - stellar.expert explorer links opened in new tabs (frame-ancestors
          //     is intentionally restrictive — see X-Frame-Options below)
          // ---------------------------------------------------------------
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline eval needed by Next.js dev HMR and
              // Freighter's content-script injection.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension: moz-extension:",
              // Styles: self + inline (Tailwind injects style attributes).
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + IPFS gateway for NFT metadata images.
              "img-src 'self' data: blob: https://images.unsplash.com https://ipfs.io https://*.ipfs.io",
              // Fonts: self + Google Fonts (Inter + JetBrains Mono via next/font).
              "font-src 'self' https://fonts.gstatic.com",
              // Fetch / XHR / WebSocket:
              //   - self (Next.js API routes + HMR websocket)
              //   - Stellar Soroban RPC (testnet + mainnet via gateway.fm)
              //   - Freighter extension bridge
              "connect-src 'self' " +
                "https://soroban-rpc.testnet.stellar.gateway.fm " +
                "https://soroban-rpc.mainnet.stellar.gateway.fm " +
                "https://horizon-testnet.stellar.org " +
                "https://horizon.stellar.org " +
                "https://ipfs.io " +
                "chrome-extension: moz-extension: ws://localhost:* wss://localhost:*",
              // Frames: nothing embeds in an iframe (prevents clickjacking).
              "frame-src 'none'",
              // Workers: self only.
              "worker-src 'self' blob:",
              // Manifest for PWA (optional, harmless).
              "manifest-src 'self'",
              // Media (audio/video): self only.
              "media-src 'self'",
              // Object/embed: disabled.
              "object-src 'none'",
              // Base URI: locked to self to prevent base-tag injection.
              "base-uri 'self'",
              // Form submissions: self only.
              "form-action 'self'",
              // Prevent this page from being framed by anyone.
              "frame-ancestors 'none'",
              // Force HTTPS upgrade for mixed-content subresources.
              "upgrade-insecure-requests",
            ].join("; "),
          },

          // Prevent clickjacking — belt-and-suspenders alongside CSP frame-ancestors.
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Prevent MIME-type sniffing, which can turn innocent uploads into
          // executable scripts in older browsers.
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Send the full URL as Referer when navigating within the same origin;
          // send only the origin when crossing to HTTPS; send nothing to HTTP.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Permissions-Policy: opt out of browser APIs the app doesn't use.
          // Freighter is a wallet extension, not a hardware device — no USB needed.
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()", // opt out of FLoC / Topics API
              "payment=()",
              "usb=()",
              "bluetooth=()",
              "display-capture=()",
              "fullscreen=(self)", // allow fullscreen for video content
            ].join(", "),
          },

          // Tell browsers to only connect over HTTPS for the next 2 years and
          // include subdomains. Remove preload / includeSubDomains if the
          // deployment doesn't control all subdomains.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Opt out of Google's FLoC / Topics-based ad targeting.
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          // Cross-Origin policies: tighten resource isolation.
          // COEP is set to unsafe-none to keep Freighter and IPFS images working
          // without needing to CORP-annotate every third-party asset.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", // allow Freighter popup window
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
