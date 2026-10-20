import type { NextConfig } from "next";
import { securityHeaders } from "./src/server/config/security-headers";

const config: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.PROSPEO_LOCAL_E2E === "1" ? ".next-local-e2e" : ".next",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
export default config;
