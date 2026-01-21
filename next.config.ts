import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Ensure proper directory resolution
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cnakpop.com',
      },
      {
        protocol: 'http',
        hostname: 'cnakpop.com',
      },
      {
        protocol: 'https',
        hostname: 'www.ktown4u.com',
      },
      {
        protocol: 'http',
        hostname: 'www.ktown4u.com',
      },
      {
        protocol: 'https',
        hostname: 'ktown4u.com',
      },
      {
        protocol: 'http',
        hostname: 'ktown4u.com',
      },
      // Add other common image domains that might be used
      {
        protocol: 'https',
        hostname: '**.cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopifycdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.lookfantastic.com',
      },
      {
        protocol: 'https',
        hostname: '**.thcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'tse*.mm.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'usfoodz.eu',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
