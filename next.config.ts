import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build (Convex needs `npx convex dev` to generate types)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use Turbopack (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
