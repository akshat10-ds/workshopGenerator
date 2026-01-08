import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-optimized settings
  turbopack: {
    root: __dirname,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
