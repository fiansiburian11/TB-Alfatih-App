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
};

export default nextConfig;
