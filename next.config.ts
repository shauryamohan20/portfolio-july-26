import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project screenshots are served from Cloudinary; thumbnails uploaded
    // through the admin panel are local files under /public.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dmtirqg8e/image/upload/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Thumbnail uploads are capped at 6MB in the action itself.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
