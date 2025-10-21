import type { NextConfig } from "next";

const path = require("path");
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
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
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
