import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests run against the built `_site/`, not the sources, so what is
 * checked is what deploys. They run in CI: the local machine's Chromium
 * cannot launch (user-namespace restriction), which is why the scoring
 * arithmetic is tested separately in `bun test` with no browser at all.
 */
/**
 * Set SMOKE_BASE_URL to run the same suite against a deployed site instead of
 * a local build. That is how a deployment gets verified rather than assumed.
 */
const LIVE = process.env.SMOKE_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  webServer: LIVE
    ? undefined
    : {
        command: "bun run scripts/serve.ts",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  use: { baseURL: LIVE ?? "http://127.0.0.1:4173", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
