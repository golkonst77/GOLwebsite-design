import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";

const sizes = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];
const screenshots = "test-results/screenshots";
mkdirSync(screenshots, { recursive: true });
async function dismissCookies(page: Page) {
  if (
    await page.evaluate(() => Boolean(localStorage.getItem("gol_consent_v1")))
  )
    return;
  const button = page.getByRole("button", {
    name: "Только необходимые",
    exact: true,
  });
  await button.waitFor({ state: "visible" });
  await button.click();
}
for (const [width, height] of sizes)
  test(`LexRadar ${width}x${height}: layout, anchors, disabled form, accessibility`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/lexradar?utm_source=browser");
    await dismissCookies(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    for (const link of [
      page.locator(".lr-nav-cta"),
      page.locator(".lr-actions .lr-button"),
    ]) {
      const box = await link.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    if (width <= 390) expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    }
    await page.screenshot({
      path: `${screenshots}/lexradar-${width}-hero.png`,
    });
    await page.screenshot({
      path: `${screenshots}/lexradar-${width}-full.png`,
      fullPage: true,
    });
    await page.locator(".lr-actions .lr-secondary").click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Math.abs(
              document.querySelector("#risks")!.getBoundingClientRect().top,
            ) < 80,
        ),
      )
      .toBe(true);
    await page.locator(".lr-nav-cta").click();
    await expect(
      page.getByText("Онлайн-приём заявок пока не подтверждён.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Отправить на бесплатную проверку" }),
    ).toBeDisabled();
    expect(new URL(page.url()).searchParams.get("utm_source")).toBe("browser");
    const axe = await new AxeBuilder({ page })
      .include(".lexradar")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      axe.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });

test("home regression: sections, UTM promo, mobile menu and invisible links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?utm_source=partner&utm_campaign=lexradar");
  await dismissCookies(page);
  for (const id of ["cases", "services", "testimonials", "contact"])
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator("#mobile-navigation")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await expect(
    page.getByRole("button", { name: "Закрыть меню" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: "LexRadar", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Открыть меню" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: "Открыть меню" }),
  ).toBeFocused();
  await page.locator("#cases").scrollIntoViewIfNeeded();
  await expect(page.locator("#cases .transform").first()).toHaveClass(
    /opacity-100/,
  );
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page.getByRole("link", { name: "LexRadar", exact: true }).click();
  await expect(page).toHaveURL(
    /lexradar\?utm_source=partner&utm_campaign=lexradar/,
  );
  await page.goto("/?utm_source=promo");
  await page
    .getByRole("link", { name: "Бесплатный аудит сайта", exact: false })
    .click();
  await expect(page).toHaveURL(/lexradar\?utm_source=promo/);
});

test("metadata, PNG and legal pages are served by production build", async ({
  page,
  request,
}) => {
  await page.goto("/lexradar");
  await expect(page).toHaveTitle(
    "LexRadar — юридический аудит сайта | GØL Web Studio",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://www.golwebstudio.ru/lexradar",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://www.golwebstudio.ru/lexradar/og.png",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  const image = await request.get("/lexradar/og.png");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  const bytes = await image.body();
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
  for (const route of ["/privacy", "/lexradar/consent"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toContainText("Голубев");
  }
  const legacy = await request.post("/api/lead", { data: {} });
  expect(legacy.status()).toBe(400);
  expect((await legacy.json()).error).toBe("CONSENT_REQUIRED");
  const api = await request.post("/api/lexradar", { data: {} });
  expect(api.status()).toBe(503);
  expect(await api.json()).toEqual({ ok: false, code: "UNAVAILABLE" });
});

test("keyboard skip, consent settings, no analytics without consent, 200% text zoom", async ({
  page,
}) => {
  const analytics: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/_vercel/insights"))
      analytics.push(request.url());
  });
  await page.goto("/lexradar");
  await dismissCookies(page);
  await page.reload();
  await page.keyboard.press("Tab");
  await expect(page.locator(".lr-skip")).toBeFocused();
  await page.keyboard.press("Enter");
  expect(new URL(page.url()).hash).toBe("#main-content");
  await page.getByRole("button", { name: "Настройки cookies" }).click();
  await expect(
    page.getByRole("dialog", { name: "Настройки cookies" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Сохранить", exact: false }).click();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(analytics).toEqual([]);
});

async function enabledForm(page: Page) {
  await page.goto(
    "http://127.0.0.1:3101/lexradar?utm_source=browser&utm_campaign=test",
  );
  await dismissCookies(page);
  await page.locator("[name=site]").fill("https://example.invalid");
  await page.locator("[name=name]").fill("Тест");
  await page.locator("[name=email]").fill("test@example.invalid");
  await page.locator("[name=consent]").check();
}
// Browser responses below are mocks. They do NOT confirm real SMTP delivery.
test("enabled form native validation and successful mock submission with UTM, optional phone empty", async ({
  page,
}) => {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/lexradar", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { ok: true, code: "ACCEPTED" } });
  });
  await page.goto("http://127.0.0.1:3101/lexradar");
  await dismissCookies(page);
  await page
    .getByRole("button", { name: "Отправить на бесплатную проверку" })
    .click();
  expect(requests.length).toBe(0);
  expect(await page.locator("input:invalid").count()).toBeGreaterThan(0);
  await page.locator("[name=site]").fill("https://example.invalid");
  await page.locator("[name=name]").fill("Тест");
  await page.locator("[name=email]").fill("bad-email");
  await page.locator("[name=consent]").check();
  await page
    .getByRole("button", { name: "Отправить на бесплатную проверку" })
    .click();
  expect(requests.length).toBe(0);
  await enabledForm(page);
  await page
    .getByRole("button", { name: "Отправить на бесплатную проверку" })
    .click();
  await expect(
    page.getByText("Заявка передана в почтовый сервис.", { exact: false }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].phone).toBe("");
  expect(requests[0].utm).toEqual({
    utm_source: "browser",
    utm_campaign: "test",
  });
  expect(requests[0].requestId).toMatch(/^[a-f0-9-]{36}$/);
});
for (const [status, code, text] of [
  [400, "VALIDATION", "Проверьте адрес сайта"],
  [429, "RATE_LIMIT", "Слишком много попыток"],
  [502, "SEND_FAILED", "Почтовый сервис отклонил"],
  [504, "DELIVERY_UNCONFIRMED", "Статус доставки не подтверждён"],
] as const)
  test(`form ${status} ${code}: honest error, preserves data`, async ({
    page,
  }) => {
    await page.route("**/api/lexradar", (route) =>
      route.fulfill({ status, json: { ok: false, code } }),
    );
    await enabledForm(page);
    await page
      .getByRole("button", { name: "Отправить на бесплатную проверку" })
      .click();
    await expect(page.locator(".lr-form [role=alert]")).toContainText(text);
    await expect(page.locator("[name=email]")).toHaveValue(
      "test@example.invalid",
    );
    await expect(
      page.getByText("Заявка передана в почтовый сервис.", { exact: false }),
    ).toHaveCount(0);
    if (status === 504)
      await expect(
        page.getByRole("button", { name: "Отправить на бесплатную проверку" }),
      ).toBeDisabled();
  });
test("network failure cannot expose raw errors or claim success", async ({
  page,
}) => {
  await page.route("**/api/lexradar", (route) => route.abort("failed"));
  await enabledForm(page);
  await page
    .getByRole("button", { name: "Отправить на бесплатную проверку" })
    .click();
  await expect(page.locator(".lr-form [role=alert]")).toContainText(
    "Статус доставки не подтверждён",
  );
  await expect(
    page.getByRole("button", { name: "Отправить на бесплатную проверку" }),
  ).toBeDisabled();
});

for (const mode of ["invalid JSON", "missing acceptance code"] as const)
  test(`malformed API response: ${mode}`, async ({ page }) => {
    await page.route("**/api/lexradar", (route) =>
      route.fulfill(
        mode === "invalid JSON"
          ? {
              status: 200,
              body: "PRIVATE INTERNAL ERROR",
              contentType: "text/plain",
            }
          : { status: 200, json: { ok: true } },
      ),
    );
    await enabledForm(page);
    await page
      .getByRole("button", { name: "Отправить на бесплатную проверку" })
      .click();
    await expect(page.locator(".lr-form [role=alert]")).toContainText(
      "Статус доставки не подтверждён",
    );
    await expect(page.locator(".lr-form")).not.toContainText(
      "PRIVATE INTERNAL ERROR",
    );
    await expect(
      page.getByText("Заявка передана в почтовый сервис.", { exact: false }),
    ).toHaveCount(0);
  });

test("blocked localStorage still lets visitor close cookie banner", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/lexradar");
  await dismissCookies(page);
  await expect(
    page.getByRole("dialog", { name: "Настройки cookies" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
