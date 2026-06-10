import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/tools/peds-arrest-algorithm",
        destination: "/tools/peds-medical-arrest",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
