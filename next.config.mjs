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
        source: "/:path*",
        headers: [
          {
            // Restricts where the app can load/frame content from, mitigating
            // XSS and clickjacking via injected resources. frame-ancestors
            // 'self' also blocks embedding this site in a foreign iframe.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://images.unsplash.com https://ipfs.io",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-ancestors 'self'",
            ].join("; "),
          },
          {
            // Prevents this site from being framed by other origins
            // (clickjacking protection); redundant with frame-ancestors
            // above for browsers that only support the older header.
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Stops browsers from MIME-sniffing a response away from its
            // declared Content-Type, which can turn a non-executable
            // response into executable script in some legacy browsers.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Forces HTTPS for this origin (and subdomains) for a year,
            // including on the very first request via preload once
            // submitted to the HSTS preload list.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
