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
};

export default nextConfig;
