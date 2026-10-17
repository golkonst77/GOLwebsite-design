import { readFileSync, existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: existsSync("/usr/bin/chromium") ? ["--no-sandbox"] : [],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    "<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}</style>" +
      readFileSync("public/lexradar/og.svg", "utf8"),
  );
  await page.screenshot({ path: "public/lexradar/og.png" });
} finally {
  await browser.close();
}
