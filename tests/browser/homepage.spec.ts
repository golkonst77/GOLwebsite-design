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
mkdirSync("docs/lexradar-004-screenshots", { recursive: true });
for (const [width, height] of sizes)
  test(`homepage two directions ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      Math.random = () => 0.42;
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/?utm_source=partner&utm_campaign=hero004");
    await page
      .getByRole("button", { name: "Только необходимые", exact: true })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Сайты для малого бизнеса, которые приводят заявки",
    );
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
      "услуг",
    );
    await expect(page.locator(".hero-legal")).toContainText(
      "Бесплатная предварительная проверка LexRadar",
    );
    await expect(page.locator(".hero-legal")).toContainText(
      "Юридическая проверка · РФ",
    );
    await expect(page.locator(".hero-legal-cta")).toHaveAttribute(
      "href",
      "/lexradar?utm_source=partner&utm_campaign=hero004",
    );
    await page.screenshot({
      path: `docs/lexradar-004-screenshots/after-${width}.png`,
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
    // Both business directions are in the first viewport; portfolio moves below them on mobile.
    expect(layout.cta.bottom).toBeLessThanOrEqual(height);
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
        expect(card.left).toBeGreaterThan(layout.copy.right);
        expect(card.bottom).toBeLessThan(layout.legal.top);
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
          return card.left < copy.right || card.bottom > legal.top;
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
      /\/lexradar\?utm_source=partner&utm_campaign=hero004/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ваш сайт может работать идеально",
    );
    await expect(
      page.getByRole("button", { name: "Отправить на бесплатную проверку" }),
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
