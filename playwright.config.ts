import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "test-results/artifacts",
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 45000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args:
        process.env.CI || existsSync("/usr/bin/chromium")
          ? ["--no-sandbox"]
          : [],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/lexradar",
      reuseExistingServer: false,
      env: { LEXRADAR_FORM_ENABLED: "false" },
    },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101/lexradar",
      reuseExistingServer: false,
      env: {
        LEXRADAR_FORM_ENABLED: "true",
        LEXRADAR_SITE_ORIGIN: "http://127.0.0.1:3101",
        LEXRADAR_ABUSE_MODE: "single-process",
        LEXRADAR_TRUST_PROXY: "false",
        SMTP_HOST: "smtp.mail.ru", SMTP_USER: "browser@example.invalid",
        SMTP_PASS: "browser-mock-only",
        LEAD_TO_EMAIL: "golwebstudio@bk.ru",
      },
    },
  ],
});
