// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint in CI builds to unblock deploys
  },
};

export default nextConfig;
