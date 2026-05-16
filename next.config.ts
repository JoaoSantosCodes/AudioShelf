import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      }
    ],
  },
  // Fix for Turbopack + PWA Plugin conflict in Next.js 15
  experimental: {
    // Setting an empty turbopack config allows the build to proceed 
    // when using plugins that modify webpack.
    turbopack: {},
  } as any,
};

export default withPWA(nextConfig);
