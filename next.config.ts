import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.ap-northeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dshelper-s3.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // 개발 환경에서 unoptimized 이미지 허용 (필요시)
    unoptimized: false,
  },
};

export default nextConfig;
