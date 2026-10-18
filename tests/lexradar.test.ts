import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createLexradarHandler } from "../lib/lexradar-handler";
import { lexradarSchema } from "../lib/lexradar-validation";
import { CONSENT_VERSION, collectUtm } from "../lib/lexradar-constants";
import { getLexradarConfig, type LexradarConfig } from "../lib/lexradar-config";
import {
  createEmailSender,
  type EmailInput,
  type EmailResult,
  type MailTransport,
} from "../lib/email-service";

const origin = "https://www.golwebstudio.ru";
const settings: LexradarConfig = {
  enabled: true,
  origin,
  abuseMode: "single-process",
  clientIpHeader: null,
  ready: true,
};
const valid = () => ({
  requestId: randomUUID(),
  consentVersion: CONSENT_VERSION,
  site: "https://example.invalid",
  name: "Тест",
  email: "test@example.invalid",
  consent: true,
});
function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://internal-proxy:3000/api/lexradar", {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
function fixture(
  options: {
    outcome?: EmailResult;
    config?: LexradarConfig;
    now?: () => number;
    send?: (mail: EmailInput) => Promise<EmailResult>;
    readTimeout?: number;
  } = {},
) {
  const mails: EmailInput[] = [];
  const handler = createLexradarHandler({
    notify: async () => "DISABLED",
    config: () => options.config || settings,
    now: options.now,
    readTimeout: options.readTimeout,
    send: async (mail) => {
      mails.push(mail);
      return options.send
        ? options.send(mail)
        : options.outcome || { success: true };
    },
  });
  return { handler, mails };
}

test("valid request: real handler sends one escaped email and returns explicit acceptance", async () => {
  const { handler, mails } = fixture();
  const response = await handler(
    request({
      ...valid(),
      comment: '<img src=x onerror=alert(1)> & "x"',
      utm: { utm_source: "partner", secret: "discarded" },
    }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, code: "ACCEPTED" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(mails.length, 1);
  assert.match(mails[0].text || "", /Идентификатор заявки: [a-f0-9-]{36}/);
  assert.equal(mails[0].replyTo, "test@example.invalid");
  assert.ok(mails[0].text?.includes("partner"));
  assert.ok(!mails[0].text?.includes("discarded"));
  assert.ok(mails[0].html.includes("&lt;img"));
  assert.ok(mails[0].html.includes("&amp; &quot;x&quot;"));
  assert.ok(!mails[0].html.includes("<img"));
  assert.ok(mails[0].text?.includes(CONSENT_VERSION));
});

for (const field of [
  "site",
  "name",
  "email",
  "consent",
  "consentVersion",
  "requestId",
]) {
  test(`missing required ${field} returns 400 without sending`, async () => {
    const body: Record<string, unknown> = valid();
    delete body[field];
    const { handler, mails } = fixture();
    assert.equal((await handler(request(body))).status, 400);
    assert.equal(mails.length, 0);
  });
}
for (const [label, patch] of Object.entries({
  "bad URL": { site: "not a URL" },
  javascript: { site: "javascript:alert(1)" },
  "data URL": { site: "data:text/html,test" },
  FTP: { site: "ftp://example.invalid" },
  credentials: { site: "https://user:pass@example.invalid" },
  "blank name": { name: "  " },
  "header injection": {
    email: "test@example.invalid\r\nBcc: other@example.invalid",
  },
  "consent false": { consent: false },
  "consent string": { consent: "true" },
  "stale consent": { consentVersion: "old" },
  "phone symbols": { phone: "++-" },
  "phone misplaced plus": { phone: "12+34567" },
  "short phone": { phone: "123" },
  "long comment": { comment: "x".repeat(2001) },
  "bad UTM": { utm: { utm_campaign: "a\r\nspoof" } },
  honeypot: { company: "bot" },
})) {
  test(`invalid ${label}: 400 and no mail`, async () => {
    const { handler, mails } = fixture();
    const response = await handler(request({ ...valid(), ...patch }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, code: "VALIDATION" });
    assert.equal(mails.length, 0);
  });
}
for (const body of [null, [], "string", 3])
  test(`non-object body ${JSON.stringify(body)}`, async () => {
    assert.equal((await fixture().handler(request(body))).status, 400);
  });
for (const extras of [
  {},
  { phone: "", comment: "" },
  { phone: "+7 (999) 123-45-67", comment: "Комментарий\nв две строки" },
])
  test(`optional data ${JSON.stringify(extras)}`, async () => {
    const { handler, mails } = fixture();
    assert.equal(
      (await handler(request({ ...valid(), ...extras }))).status,
      200,
    );
    assert.equal(mails.length, 1);
  });

test("canonical Origin works behind internal proxy; forged host cannot authorize another origin", async () => {
  const { handler, mails } = fixture();
  assert.equal((await handler(request(valid()))).status, 200);
  for (const candidate of [
    "https://evil.invalid",
    "null",
    "",
    "http://www.golwebstudio.ru",
  ]) {
    assert.equal(
      (
        await handler(
          request(valid(), {
            origin: candidate,
            "x-forwarded-host": "evil.invalid",
            "x-forwarded-proto": "https",
          }),
        )
      ).status,
      403,
    );
  }
  assert.equal(
    (await handler(request(valid(), { "sec-fetch-site": "cross-site" })))
      .status,
    403,
  );
  assert.equal(mails.length, 1);
});
test("JSON media type must be exact, supports charset", async () => {
  const { handler } = fixture();
  assert.equal(
    (
      await handler(
        request(valid(), { "content-type": "application/json; charset=utf-8" }),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await handler(
        request(valid(), { "content-type": "application/json-evil" }),
      )
    ).status,
    415,
  );
});
test("invalid JSON and deceptive content length return safe errors", async () => {
  const { handler, mails } = fixture();
  const malformed = new NextRequest(origin + "/api/lexradar", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: "{",
  });
  assert.equal((await handler(malformed)).status, 400);
  assert.equal(
    (await handler(request(valid(), { "content-length": "20000" }))).status,
    413,
  );
  assert.equal(
    (await handler(request(valid(), { "content-length": "-1" }))).status,
    413,
  );
  assert.equal(mails.length, 0);
});
test("chunked request is bounded by actual bytes, even with small claimed size", async () => {
  const { handler, mails } = fixture();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(10000));
      controller.enqueue(new Uint8Array(10000));
      controller.close();
    },
  });
  const response = await handler(
    new NextRequest(origin + "/api/lexradar", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        "content-length": "1",
      },
      body: stream,
    }),
  );
  assert.equal(response.status, 413);
  assert.equal(mails.length, 0);
});
test("slow body is cancelled on timeout", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const { handler } = fixture({ readTimeout: 5 });
  assert.equal(
    (
      await handler(
        new NextRequest(origin + "/api/lexradar", {
          method: "POST",
          headers: { origin, "content-type": "application/json" },
          body: stream,
        }),
      )
    ).status,
    400,
  );
  assert.ok(cancelled);
});
test("forged XFF cannot rotate shared limiter; expires after ten minutes", async () => {
  let time = 0;
  const { handler } = fixture({ now: () => time });
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await handler(request({}, { "x-forwarded-for": `192.0.2.${i}` })))
        .status,
      400,
    );
  const limited = await handler(
    request(valid(), { "x-forwarded-for": "192.0.2.99" }),
  );
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "600");
  time = 600001;
  assert.equal((await handler(request(valid()))).status, 200);
});
test("trusted header must contain a single valid address; untrusted XFF ignored", async () => {
  const { handler } = fixture({
    config: { ...settings, clientIpHeader: "x-real-ip" },
  });
  assert.equal((await handler(request(valid()))).status, 400);
  assert.equal(
    (await handler(request(valid(), { "x-real-ip": "192.0.2.1, 192.0.2.2" })))
      .status,
    400,
  );
  for (const ip of ["192.0.2.1", "2001:db8::1"])
    assert.equal(
      (
        await handler(
          request(valid(), { "x-real-ip": ip, "x-forwarded-for": "spoof" }),
        )
      ).status,
      200,
    );
});
test("concurrent and later retries with same UUID send once; changed body conflicts", async () => {
  let release!: (result: EmailResult) => void;
  const { handler, mails } = fixture({
    send: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  const body = valid();
  const first = handler(request(body));
  await new Promise((resolve) => setImmediate(resolve));
  const second = handler(request(body));
  release({ success: true });
  for (const response of await Promise.all([first, second]))
    assert.equal(response.status, 200);
  assert.equal((await handler(request(body))).status, 200);
  assert.equal(
    (await handler(request({ ...body, name: "changed" }))).status,
    409,
  );
  assert.equal(mails.length, 1);
});
for (const [label, outcome, status, code] of [
  [
    "rejected",
    { success: false, error: "PRIVATE SMTP DETAIL" },
    502,
    "SEND_FAILED",
  ],
  ["timeout", { success: false, uncertain: true }, 504, "DELIVERY_UNCONFIRMED"],
] as const)
  test(`SMTP ${label} cannot report success or leak details`, async () => {
    const { handler, mails } = fixture({ outcome });
    const body = valid();
    const response = await handler(request(body));
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { ok: false, code });
    assert.equal((await handler(request(body))).status, status);
    assert.equal(mails.length, 1);
  });
test("unexpected thrown transport error returns uncertain safe result", async () => {
  const { handler } = fixture({
    send: async () => {
      throw new Error("SECRET SMTP DETAIL");
    },
  });
  const response = await handler(request(valid()));
  assert.equal(response.status, 504);
  assert.equal(
    await response.text(),
    '{"ok":false,"code":"DELIVERY_UNCONFIRMED"}',
  );
});
test("disabled or unconfigured never calls transport", async () => {
  for (const config of [
    { ...settings, enabled: false },
    { ...settings, ready: false },
  ]) {
    const { handler, mails } = fixture({ config });
    assert.equal((await handler(request(valid()))).status, 503);
    assert.equal(mails.length, 0);
  }
});
test("configuration fails closed without explicit origin and deployment mode", () => {
  const base = {
    LEXRADAR_FORM_ENABLED: "true",
    SMTP_HOST: "smtp.mail.ru", SMTP_USER: "test@example.invalid",
    SMTP_PASS: "mock-only",
    LEXRADAR_SITE_ORIGIN: origin,
    LEXRADAR_ABUSE_MODE: "single-process",
  };
  assert.equal(getLexradarConfig(base).ready, true);
  for (const patch of [
    { LEXRADAR_SITE_ORIGIN: "" },
    { LEXRADAR_SITE_ORIGIN: "https://evil.invalid/path" },
    { LEXRADAR_SITE_ORIGIN: "http://example.invalid" },
    { LEXRADAR_ABUSE_MODE: "" },
    { SMTP_PASS: " " },
    { LEAD_TO_EMAIL: "bad" },
    { LEXRADAR_ABUSE_MODE: "edge" },
  ])
    assert.equal(getLexradarConfig({ ...base, ...patch }).ready, false);
  assert.equal(
    getLexradarConfig({
      ...base,
      LEXRADAR_ABUSE_MODE: "edge",
      LEXRADAR_TRUST_PROXY: "true",
      LEXRADAR_CLIENT_IP_HEADER: "x-real-ip",
      LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED: "true",
    }).ready,
    true,
  );
});
test("UTM selection is consistent, bounded, and drops unrelated parameters", () => {
  assert.deepEqual(
    collectUtm(
      "?email=private&utm_source=partner&utm_campaign=hello%20world&utm_content=" +
        "x".repeat(300),
    ),
    {
      utm_source: "partner",
      utm_campaign: "hello world",
      utm_content: "x".repeat(200),
    },
  );
  assert.equal(
    lexradarSchema.safeParse({
      ...valid(),
      utm: { utm_source: "x".repeat(201) },
    }).success,
    false,
  );
});

// These transport tests use mock receipts/errors. They do NOT confirm real SMTP delivery.
const env = () => ({
  SMTP_HOST: "smtp.mail.ru", SMTP_USER: "sender@example.invalid",
  SMTP_PASS: "mock-only",
});
const mail: EmailInput = {
  to: "recipient@example.invalid",
  subject: "Test",
  html: "<p>test</p>",
};
for (const [label, receipt, expected] of [
  [
    "accepted",
    {
      accepted: ["recipient@example.invalid"],
      rejected: [],
      messageId: "mock",
    },
    true,
  ],
  [
    "rejected",
    { accepted: [], rejected: ["recipient@example.invalid"] },
    false,
  ],
  ["missing receipt", {}, false],
] as const)
  test(`email service: ${label}`, async () => {
    let closed = false;
    const send = createEmailSender({
      env,
      makeTransport: () => ({
        sendMail: async () => ({
          ...receipt,
          ...("accepted" in receipt
            ? {
                accepted: [...receipt.accepted],
                rejected: [...receipt.rejected],
              }
            : {}),
        }),
        close: () => {
          closed = true;
        },
      }),
    });
    assert.equal((await send(mail)).success, expected);
    assert.ok(closed);
  });
test("email service bounds a stalled SMTP session and closes transport", async () => {
  let closed = false;
  const transport: MailTransport = {
    sendMail: () => new Promise(() => {}),
    close: () => {
      closed = true;
    },
  };
  const send = createEmailSender({
    env,
    timeoutMs: 5,
    makeTransport: () => transport,
  });
  assert.deepEqual(await send(mail), {
    success: false,
    error: "SMTP_TIMEOUT",
    uncertain: true,
  });
  assert.ok(closed);
});
test("email service sanitizes auth failure, closes, rejects missing credentials/injected headers", async () => {
  let calls = 0;
  const makeTransport = () => {
    calls++;
    return {
      sendMail: async () => {
        throw Object.assign(new Error("secret"), { code: "EAUTH" });
      },
      close() {},
    };
  };
  const send = createEmailSender({ env, makeTransport });
  assert.deepEqual(await send(mail), {
    success: false,
    error: "SMTP_SEND_FAILED",
    uncertain: false,
    smtpCode: "EAUTH",
  });
  assert.equal(
    (
      await send({
        ...mail,
        replyTo: "a@example.invalid\r\nBcc:b@example.invalid",
      })
    ).success,
    false,
  );
  assert.equal(
    (await createEmailSender({ env: () => ({}), makeTransport })(mail)).success,
    false,
  );
  assert.equal(calls, 1);
});
