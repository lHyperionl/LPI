import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output -> stihly Docker image (server.js + iba runtime deps).
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
