import type { NextConfig } from "next";
import { securityHeaders } from "./src/server/config/security-headers";

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
export default config;
