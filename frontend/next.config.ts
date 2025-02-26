import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["node-screenshots"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // This ensures native Node.js modules are properly handled
      config.externals = [...(config.externals || []), "node-screenshots"];
    }
    return config;
  },
};

export default nextConfig;
