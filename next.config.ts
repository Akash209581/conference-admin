import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/conference-admin",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
