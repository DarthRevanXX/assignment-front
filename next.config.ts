import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disabled due to Next.js 16 + Turbopack compatibility issue
  // Re-enable when bug is fixed: https://github.com/vercel/next.js/issues
  // output: "standalone",

  // Performance optimizations
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // React strict mode for better performance warnings
  reactStrictMode: true,

  // Optimize CSS
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
