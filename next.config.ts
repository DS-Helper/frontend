import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
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
