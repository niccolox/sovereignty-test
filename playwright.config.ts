import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests run against the built `_site/`, not the sources, so what is
 * checked is what deploys. They run in CI: the local machine's Chromium
 * cannot launch (user-namespace restriction), which is why the scoring
 * arithmetic is tested separately in `bun test` with no browser at all.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  webServer: {
    command: "bunx --bun serve _site -l 4173 --no-clipboard",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: { baseURL: "http://127.0.0.1:4173", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
