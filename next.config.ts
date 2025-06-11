import type { NextConfig } from "next";
require('dotenv').config()
/**@type(import('next').NextConfig) */
const nextConfig: NextConfig = {
  output: 'standalone',
  env: {API_ENDPOINT:process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
};

export default nextConfig;
