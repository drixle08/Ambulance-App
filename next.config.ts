import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
