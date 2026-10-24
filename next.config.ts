import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        // The service worker must never be served from the HTTP cache, or
        // browsers can miss an update (public/sw.js is regenerated per build).
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
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
