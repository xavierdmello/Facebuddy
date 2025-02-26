import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Only include node-window-manager in server-side builds
    if (isServer) {
      return config;
    }

    // Exclude node-window-manager from client-side builds
    config.externals = [
      ...(config.externals || []),
      "@johnlindquist/node-window-manager",
    ];

    return config;
  },
  // Ensure API routes are treated as server-side only
  experimental: {
    serverComponentsExternalPackages: ["@johnlindquist/node-window-manager"],
  },
};

export default nextConfig;
