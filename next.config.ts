import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['dshelper-s3.s3.ap-northeast-2.amazonaws.com'],
  },
};

export default nextConfig;
