import { test } from "node:test";
import assert from "node:assert/strict";
import { getSmtpConfig } from "../lib/smtp-config";
import { getLexradarConfig } from "../lib/lexradar-config";
import { createEmailSender } from "../lib/email-service";

const env = {
  SMTP_HOST: "smtp.mail.ru",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "sender@example.invalid",
  SMTP_PASSWORD: "unit-test-only",
};

test("implicit TLS and STARTTLS use configured host with certificate verification", () => {
  const implicit = getSmtpConfig(env)!;
  assert.equal(implicit.options.host, "smtp.mail.ru");
  assert.equal(implicit.options.secure, true);
  assert.equal(implicit.options.tls.servername, "smtp.mail.ru");
  assert.equal(implicit.options.tls.minVersion, "TLSv1.2");
  const starttls = getSmtpConfig({ ...env, SMTP_PORT: "587", SMTP_SECURE: "false" })!;
  assert.equal(starttls.options.secure, false);
  assert.equal(starttls.options.requireTLS, true);
  assert.equal(getSmtpConfig({ ...env, SMTP_SECURE: undefined })!.options.secure, true);
});

test("invalid or partial generic settings never fall back to legacy credentials", () => {
  const legacy = { YANDEX_EMAIL: "old@example.invalid", YANDEX_PASSWORD: "unit-test-only" };
  assert.equal(getSmtpConfig(legacy)!.options.host, "2a02:6b8::19d");
  assert.equal(getSmtpConfig(legacy)!.options.tls.servername, "smtp.yandex.ru");
  assert.equal(getSmtpConfig({ ...legacy, SMTP_HOST: "smtp.mail.ru" }), null);
  for (const patch of [
    { SMTP_HOST: "" }, { SMTP_HOST: "https://smtp.mail.ru" },
    { SMTP_HOST: "smtp.mail.ru\r\nspoof" }, { SMTP_USER: "" },
    { SMTP_PASSWORD: "" }, { SMTP_FROM: "bad" }, { SMTP_FROM: "a@example.invalid\r\nBcc:x" },
    { SMTP_PORT: "0" }, { SMTP_PORT: "65536" }, { SMTP_PORT: "1.5" },
    { SMTP_PORT: "1e3" }, { SMTP_SECURE: "yes" }, { SMTP_SECURE: "false" },
  ]) assert.equal(getSmtpConfig({ ...env, ...patch }), null);
});

test("generic credentials participate in the existing fail-closed form gate", () => {
  const deployment = {
    ...env, LEXRADAR_SITE_ORIGIN: "https://www.golwebstudio.ru",
    LEXRADAR_ABUSE_MODE: "single-process",
  };
  assert.equal(getLexradarConfig(deployment).ready, true);
  assert.equal(getLexradarConfig(deployment).enabled, false);
  assert.equal(getLexradarConfig({ ...deployment, SMTP_PASSWORD: "" }).ready, false);
});

test("sender is configured; acceptance of a different recipient is not success", async () => {
  const mail = { to: "recipient@example.invalid", subject: "Test", html: "<p>test</p>" };
  let calls = 0;
  const send = createEmailSender({
    env: () => env,
    makeTransport: () => ({
      async sendMail(options) {
        calls++;
        assert.equal(options.from, '"GØL Web Studio" <sender@example.invalid>');
        return { accepted: ["other@example.invalid"], rejected: [] };
      },
      close() {},
    }),
  });
  assert.deepEqual(await send(mail), { success: false, error: "SMTP_REJECTED" });
  assert.equal((await send({ ...mail, to: "invalid" })).success, false);
  assert.equal(calls, 1);
});
