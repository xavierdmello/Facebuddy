import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure API routes are treated as server-side only
  experimental: {
    // Configure Turbopack properly
    turbo: {
      // Configure Turbopack to handle external packages
      resolveAlias: {
        // Handle the external package that was previously excluded in webpack
        "@johnlindquist/node-window-manager": "{}",
      },
    },
  },
  serverExternalPackages: ["@johnlindquist/node-window-manager"],
};

export default nextConfig;
