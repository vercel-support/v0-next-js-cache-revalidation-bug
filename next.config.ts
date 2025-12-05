import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/",
      destination: "/de",
      permanent: false,
    },
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
