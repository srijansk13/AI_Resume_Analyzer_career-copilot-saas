import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // @ts-ignore - Setting required to allow local network testing on mobile devices
  allowedDevOrigins: ['192.168.31.101'],
  serverExternalPackages: ['@sparticuz/chromium'],
};

export default nextConfig;
