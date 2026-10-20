import { defineConfig, devices } from "@playwright/test";
if (!process.env.REAL_SEARCH_PASSWORD) throw new Error("Configurer l’accès local dans .env.");
export default defineConfig({
  testDir: "./tests/local-e2e", outputDir: "test-results/local", reporter: "list",
  use: { baseURL: "http://127.0.0.1:3101", httpCredentials: { username: "prospeo", password: process.env.REAL_SEARCH_PASSWORD } },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } }, { name: "mobile", use: devices["Pixel 7"] }],
  webServer: { command: "pnpm exec next dev --hostname 127.0.0.1 --port 3101", env: { PROSPEO_LOCAL_E2E: "1" }, url: "http://127.0.0.1:3101", reuseExistingServer: false, timeout: 120000 },
});
