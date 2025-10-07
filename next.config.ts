import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  webpack: (config) => {
    return config;
  },
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
};

export default nextConfig;
