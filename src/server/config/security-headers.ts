import { parseEnvironment } from "./environment";
const { NODE_ENV } = parseEnvironment(process.env);

// CSP compatible avec l’hydratation App Router. Une politique par nonce sera
// nécessaire avant toute interface dynamique sensible ou exposition publique.
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'", "base-uri 'self'", "object-src 'none'",
      "frame-ancestors 'none'", "form-action 'self'",
      "script-src 'self' 'unsafe-inline'" + (NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
      "connect-src 'self'" + (NODE_ENV === "development" ? " ws://127.0.0.1:*" : ""),
    ].join("; "),
  },
];
