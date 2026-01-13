import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "veronablobstorage.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
