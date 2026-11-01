import { defineConfig } from "@playwright/test";

// Playwright forces color in child processes. Normalize the equivalent no-color
// setting so Node does not warn about both color variables being present.
if (process.env.NO_COLOR !== undefined) {
  process.env.FORCE_COLOR ??= "0";
  delete process.env.NO_COLOR;
}

// PLAYWRIGHT_BASE_URL points the @smoke checks at a deployed site; otherwise a local production build is started.
const remote = process.env.PLAYWRIGHT_BASE_URL;
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
if (!remote && (!Number.isInteger(port) || port < 1024 || port > 65535))
  throw new Error("PLAYWRIGHT_PORT must be between 1024 and 65535.");
const baseURL = remote ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "desktop-chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "tablet-chromium", use: { browserName: "chromium", viewport: { width: 768, height: 1024 } } },
    {
      name: "mobile-chromium",
      use: { browserName: "chromium", viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: `corepack yarn start --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 30_000,
      },
});
