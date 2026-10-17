import { test, expect } from "@playwright/test";
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
mkdirSync("test-results/lexradar-006-screenshots", { recursive: true });
for (const [width, height] of sizes)
  test(`homepage two directions ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      Math.random = () => 0.42;
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/?utm_source=partner&utm_campaign=hero005");
    await expect(page.getByRole("dialog", { name: "Настройки cookies" })).toBeVisible();
    await page.screenshot({path: `test-results/lexradar-006-screenshots/cookies-${width}.png`, animations: "disabled"});
    const banner = await page.getByRole("dialog", { name: "Настройки cookies" }).boundingBox();
    const legalBefore = await page.locator(".hero-legal").boundingBox();
    expect(banner!.y).toBeGreaterThanOrEqual(legalBefore!.y + legalBefore!.height);
    await page.getByRole("button", { name: "Настройки", exact: true }).click();
    await expect(page.getByRole("dialog", {name: "Настройки cookies"}).getByRole("checkbox")).not.toBeChecked();
    await page.getByRole("button", { name: "Только необходимые", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Настройки cookies" })).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({top: 0, behavior: "instant"}));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Сайты для малого бизнеса, которые приводят заявки",
    );
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
      "услуг",
    );
    await expect(page.locator(".hero-legal")).toContainText(
      "Ваш сайт работает на ваш бизнес. Убедитесь, что он не работает против вас.",
    );
    await expect(page.locator(".hero-legal")).toContainText(
      "Юридическая проверка · РФ",
    );
    await expect(page.locator(".hero-legal-cta")).toHaveAttribute(
      "href",
      "/lexradar?utm_source=partner&utm_campaign=hero005",
    );
    await page.screenshot({
      path: `test-results/lexradar-006-screenshots/after-${width}.png`,
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const layout = await page.evaluate(() => {
      const rect = (selector: string) => {
        const box = document.querySelector(selector)!.getBoundingClientRect();
        return {
          top: box.top,
          bottom: box.bottom,
          left: box.left,
          right: box.right,
        };
      };
      return {
        heading: rect("#home-heading"),
        copy: rect(".hero-copy"),
        legal: rect(".hero-legal"),
        cta: rect(".hero-legal-cta"),
        visual: rect(".hero-visual"),
        cards: Array.from(
          document.querySelectorAll(".hero-cards-stage > div"),
        ).map((el) => {
          const box = el.getBoundingClientRect();
          return {
            top: box.top,
            bottom: box.bottom,
            left: box.left,
            right: box.right,
          };
        }),
      };
    });
    expect(layout.heading.top).toBeGreaterThanOrEqual(80);
    expect(layout.heading.left).toBeGreaterThanOrEqual(20);
    expect(layout.heading.right).toBeLessThanOrEqual(width - 20);
    // Desktop keeps both offers in view; mobile presents the legal card before portfolio.
    if (width >= 1024) expect(layout.cta.bottom).toBeLessThanOrEqual(height);
    else expect(layout.legal.top).toBeLessThan(height);
    for (const link of await page
      .locator(".hero-actions a, .hero-legal-cta, header nav a")
      .all()) {
      const box = await link.boundingBox();
      if (!box) continue;
      expect(box.x).toBeGreaterThanOrEqual(8);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 8);
      expect(box.height).toBeGreaterThan(0);
    }
    if (width >= 1024) {
      for (const card of layout.cards) {
        expect(card.right).toBeLessThan(layout.legal.left);
        expect(card.top).toBeGreaterThan(layout.copy.bottom);
      }
      await page.locator(".hero-visual").hover();
      await page.waitForTimeout(900); // Verify the completed fan animation, not its initial state.
      const overlaps = await page.evaluate(() => {
        const copy = document
          .querySelector(".hero-copy")!
          .getBoundingClientRect();
        const legal = document
          .querySelector(".hero-legal")!
          .getBoundingClientRect();
        return Array.from(
          document.querySelectorAll(".hero-cards-stage > div"),
        ).some((el) => {
          const card = el.getBoundingClientRect();
          return card.right > legal.left || card.top < copy.bottom;
        });
      });
      expect(overlaps).toBe(false);
    } else {
      expect(layout.visual.top).toBeGreaterThan(layout.legal.bottom);
    }
    const accessibility = await new AxeBuilder({ page })
      .include(".gol-hero")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      accessibility.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page
      .locator(".hero-actions")
      .getByRole("link", { name: "Смотреть кейсы", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Math.abs(
              document.querySelector("#cases")!.getBoundingClientRect().top,
            ) < 5,
        ),
      )
      .toBe(true);
    await page
      .locator(".hero-actions")
      .getByRole("link", { name: "Обсудить сайт", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Math.abs(
              document.querySelector("#contact")!.getBoundingClientRect().top,
            ) < 5,
        ),
      )
      .toBe(true);
    await page.locator(".hero-legal-cta").click();
    await expect(page).toHaveURL(
      /\/lexradar\?utm_source=partner&utm_campaign=hero005/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ваш сайт может работать идеально",
    );
    await expect(
      page.getByRole("button", { name: "Отправить на бесплатную проверку" }),
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
