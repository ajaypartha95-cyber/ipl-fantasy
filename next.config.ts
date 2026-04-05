import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["tesseract.js"],
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/**/*.wasm", "./node_modules/**/*.traineddata"],
  },
};

export default nextConfig;