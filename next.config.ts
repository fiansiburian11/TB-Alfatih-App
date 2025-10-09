import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: "C:\\Users\\bukan\\OneDrive\\Documents\\KULIAH\\FIAN SEMESTER 7\\KP\\app-katalog-tb-alfatih",
  images: {
    domains: ["api.rusnandapurnama.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.rusnandapurnama.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
