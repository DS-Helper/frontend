import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: '/**',
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: '/**',
      },
    ],
    // 개발 환경에서 unoptimized 이미지 허용 (필요시)
    unoptimized: false,
  },
};

export default nextConfig;
