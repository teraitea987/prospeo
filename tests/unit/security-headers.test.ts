import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../src/server/config/security-headers";
describe("politique des en-têtes", () => {
  const headers = Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value]));
  it("interdit l’encapsulation et le MIME sniffing", () => {
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });
  it("bloque objets, formulaires externes et eval en production/test", () => {
    const csp = headers["Content-Security-Policy"];
    for (const directive of ["object-src 'none'", "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'"]) expect(csp).toContain(directive);
    expect(csp).not.toContain("unsafe-eval");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
  });
});
