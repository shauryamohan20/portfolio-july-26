import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project screenshots are served from Cloudinary.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dmtirqg8e/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
