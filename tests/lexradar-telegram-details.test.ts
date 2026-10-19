import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createLexradarHandler } from "../lib/lexradar-handler";
import { createTelegramService } from "../lib/telegram-notifications";
import { CONSENT_VERSION } from "../lib/lexradar-constants";

const origin = "https://example.invalid";
const time = Date.parse("2026-10-19T10:00:00.000Z");
const body = {
  requestId: "00000000-0000-4000-8000-000000000003", consentVersion: CONSENT_VERSION,
  name: "  Анна  ", email: "anna@example.invalid", site: "https://example.invalid/site",
  phone: "+7 (999) 123-45-67", comment: "Вопрос <b>без HTML</b> & текст\nВторая строка",
  consent: true, utm: { utm_source: "PRIVATE_UTM" }, company: "",
  receivedAt: "FORGED_DATE", extra: "PRIVATE_EXTRA",
};
function request(patch = {}, headers = {}) {
  return new NextRequest("http://localhost/api/lexradar", { method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: JSON.stringify({ ...body, ...patch }) });
}
function fixture(apiOk = true) {
  const posts: Record<string, unknown>[] = [];
  const emails: string[] = [];
  const service = createTelegramService({ env: () => ({
    TELEGRAM_NOTIFICATIONS_ENABLED: "true", TELEGRAM_BOT_TOKEN: "123456789:" + "x".repeat(35),
    TELEGRAM_CHAT_ID: "9876543210",
  }), fetcher: async (_url, options) => {
    posts.push(JSON.parse(String(options?.body)));
    assert.equal(emails.length, 1);
    return new Response(JSON.stringify({ ok: apiOk }));
  }, report() {} });
  const handler = createLexradarHandler({ now: () => time,
    config: () => ({ ready: true, enabled: true, origin, abuseMode: "single-process", clientIpHeader: null }),
    send: async mail => { emails.push(mail.text || ""); return { success: true }; },
    notify: service.notifyAcceptedLead,
  });
  return { handler, posts, emails };
}
test("real LexRadar handler passes only validated form fields and server receipt date", async () => {
  const { handler, posts, emails } = fixture();
  assert.equal((await handler(request())).status, 200);
  assert.equal(posts.length, 1);
  const text = String(posts[0].text);
  for (const line of ["Имя: Анна", `Email: ${body.email}`, `Телефон: ${body.phone}`,
    `Сайт: ${body.site}`, `Комментарий: ${body.comment}`, "Дата поступления (UTC): 2026-10-19T10:00:00.000Z"])
    assert.ok(text.includes(line), line);
  assert.ok(emails[0].includes("2026-10-19T10:00:00.000Z"));
  assert.doesNotMatch(text, /PRIVATE_|FORGED_DATE|Согласие:|company/);
  assert.equal(posts[0].parse_mode, undefined);
  assert.deepEqual(posts[0].link_preview_options, { is_disabled: true });
  assert.equal((await handler(request())).status, 200);
  assert.equal(posts.length, 1);
  assert.equal(emails.length, 1);
});
test("optional fields are omitted when empty and Telegram API rejection leaves ACCEPTED", async () => {
  const { handler, posts } = fixture(false);
  const response = await handler(request({ phone: "", comment: "" }));
  assert.deepEqual(await response.json(), { ok: true, code: "ACCEPTED" });
  assert.doesNotMatch(String(posts[0].text), /Телефон:|Комментарий:/);
});
test("maximum form payload fits one Telegram message without losing comment", async () => {
  const { handler, posts } = fixture();
  const comment = "😀".repeat(1000);
  const email = "a".repeat(64) + "@" + "b".repeat(63) + "." + "c".repeat(63) + "." + "d".repeat(60);
  const response = await handler(request({ name: "Я".repeat(100),
    site: "https://example.invalid/" + "x".repeat(476), email, comment }));
  assert.equal(response.status, 200);
  const text = String(posts[0].text);
  assert.ok(text.length < 4096);
  assert.ok(text.includes(comment));
});
test("consent, honeypot, origin and rate limit still stop both delivery channels", async () => {
  for (const [patch, headers] of [[{ consent: false }, {}], [{ company: "spam" }, {}],
    [{ email: "invalid" }, {}], [{}, { origin: "https://attacker.invalid" }]] as const) {
    const { handler, posts, emails } = fixture();
    assert.ok((await handler(request(patch, headers))).status >= 400);
    assert.equal(posts.length, 0);
    assert.equal(emails.length, 0);
  }
  const { handler, posts, emails } = fixture();
  for (let i = 0; i < 5; i++) await handler(request({ consent: false }));
  assert.equal((await handler(request())).status, 429);
  assert.equal(posts.length, 0);
  assert.equal(emails.length, 0);
});
