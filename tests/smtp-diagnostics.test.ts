import { test } from "node:test";
import assert from "node:assert/strict";
import { auditSmtpEnvironment, runSmtpDiagnostic, type DiagnosticEvent } from "../lib/smtp-diagnostics";
import { safeSmtpError } from "../lib/smtp-errors";
import type { EmailResult } from "../lib/email-service";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const env = {
  SMTP_HOST: "smtp.mail.ru", SMTP_PORT: "465", SMTP_USER: "golwebstudio@bk.ru",
  SMTP_PASS: "unit-test-secret", SMTP_FROM: "golwebstudio@bk.ru", MAIL_TO: "golwebstudio@bk.ru",
};

test("audit identifies duplicates, empty assignments, overrides, format risks and alias conflicts without values", () => {
  const audit = auditSmtpEnvironment([
    { name: ".env.production.local", contents: "SMTP_HOST=smtp.mail.ru\nSMTP_PASS=' secret$VALUE '\nSMTP_PASS=\n" },
    { name: ".env.local", contents: "export SMTP_PORT=465\nSMTP_PASS=hidden#truncated\nMAIL_TO=golwebstudio@bk.ru\n" },
  ], { SMTP_PORT: "587" }, { ...env, SMTP_PASSWORD: "conflicting-secret" });
  assert.deepEqual(audit.duplicates, [{ source: ".env.production.local", key: "SMTP_PASS" }]);
  assert.ok(audit.definitions.some((item) => item.key === "SMTP_PASS" && item.empty));
  assert.deepEqual(audit.shadowedKeys, ["SMTP_PORT", "SMTP_PASS"]);
  assert.equal(audit.variables.find((item) => item.key === "SMTP_PORT")?.source, "process");
  assert.deepEqual(audit.conflicts, [["SMTP_PASS", "SMTP_PASSWORD"]]);
  assert.ok(audit.formatWarnings.some((item) => item.code === "CHECK_DOTENV_EXPANSION"));
  assert.ok(audit.formatWarnings.some((item) => item.code === "CHECK_PASSWORD_WHITESPACE"));
  assert.ok(audit.formatWarnings.some((item) => item.code === "CHECK_UNQUOTED_COMMENT"));
  const output = JSON.stringify(audit);
  for (const secret of ["unit-test-secret", "hidden", "truncated", "conflicting-secret", "secret$VALUE", "golwebstudio@bk.ru"])
    assert.ok(!output.includes(secret));
});

test("quoted multiline values do not manufacture duplicate keys", () => {
  const audit = auditSmtpEnvironment([{
    name: ".env.local", contents: 'SMTP_PASS="line one\nSMTP_USER=inside-password"\nSMTP_USER=real\n',
  }], {}, env);
  assert.deepEqual(audit.duplicates, []);
  assert.equal(audit.definitions.filter((item) => item.key === "SMTP_USER").length, 1);
});

test("empty and commented lines are distinguished from missing effective variables", () => {
  const audit = auditSmtpEnvironment([{
    name: ".env.local", contents: "# SMTP_USER=ignored\nSMTP_PASS=''\nSMTP_USER=  # comment\nSMTP_PORT=465\n",
  }], {}, { SMTP_PASS: "", SMTP_USER: "", SMTP_PORT: "465" });
  assert.equal(audit.definitions.filter((item) => item.empty).length, 2);
  assert.equal(audit.variables.find((item) => item.key === "SMTP_HOST")?.status, "MISSING");
  assert.equal(audit.variables.find((item) => item.key === "SMTP_PASS")?.status, "EMPTY");
});

function fixture(options: {
  mode?: "inspect" | "verify" | "production-test";
  settings?: Record<string, string>;
  duplicateCount?: number;
  failureStage?: "connection" | "authentication";
  outcome?: EmailResult;
} = {}) {
  const calls: string[] = [];
  const events: DiagnosticEvent[] = [];
  const failure = Object.assign(new Error("PASSWORD AND SMTP RESPONSE MUST NOT LEAK"), {
    code: options.failureStage === "connection" ? "ECONNREFUSED" : "EAUTH", responseCode: 535,
    response: "private@example.invalid",
  });
  const run = () => runSmtpDiagnostic({
    env: options.settings || env,
    mode: options.mode || "production-test",
    duplicateCount: options.duplicateCount || 0,
    async probe() {
      calls.push("connection");
      if (options.failureStage === "connection") throw failure;
    },
    async verify() {
      calls.push("authentication");
      if (options.failureStage === "authentication") throw failure;
    },
    async send() { calls.push("delivery"); return options.outcome || { success: true }; },
    emit: (event) => events.push(event),
  });
  return { calls, events, run };
}

test("production diagnostic authenticates before exactly one send; does not enable form", async () => {
  const settings = { ...env, LEXRADAR_FORM_ENABLED: "false" };
  const f = fixture({ settings });
  assert.equal(await f.run(), true);
  assert.deepEqual(f.calls, ["connection", "authentication", "delivery"]);
  assert.equal(f.events.at(-1)?.status, "SMTP_ACCEPTED");
  assert.equal(settings.LEXRADAR_FORM_ENABLED, "false");
});

for (const failureStage of ["connection", "authentication"] as const)
  test(failureStage + " failure prevents sending and outputs only allowlisted codes", async () => {
    const f = fixture({ failureStage });
    assert.equal(await f.run(), false);
    assert.ok(!f.calls.includes("delivery"));
    assert.equal(f.events.at(-1)?.smtpCode, failureStage === "connection" ? "ECONNREFUSED" : "EAUTH");
    assert.ok(!JSON.stringify(f.events).includes("PASSWORD"));
    assert.ok(!JSON.stringify(f.events).includes("private@"));
  });

test("duplicates, missing password, alias conflicts and wrong target stop all network work", async () => {
  for (const options of [
    { duplicateCount: 1 },
    { settings: { ...env, SMTP_PASS: "" } },
    { settings: { ...env, SMTP_PASSWORD: "different" } },
    { settings: { ...env, MAIL_TO: "other@example.invalid" } },
    { settings: { ...env, SMTP_PORT: "587", SMTP_SECURE: "false" } },
  ]) {
    const f = fixture(options);
    assert.equal(await f.run(), false);
    assert.deepEqual(f.calls, []);
  }
});

test("inspect is offline; verify never sends mail", async () => {
  for (const mode of ["inspect", "verify"] as const) {
    const f = fixture({ mode });
    assert.equal(await f.run(), true);
    assert.deepEqual(f.calls, mode === "inspect" ? [] : ["connection", "authentication"]);
  }
});

for (const outcome of [
  { success: false, smtpCode: "EAUTH", responseCode: 535 },
  { success: false, uncertain: true },
  { success: false, error: "SMTP_REJECTED" },
])
  test("failed or uncertain delivery never produces SMTP_ACCEPTED: " + JSON.stringify(outcome), async () => {
    const f = fixture({ outcome });
    assert.equal(await f.run(), false);
    assert.equal(f.calls.filter((call) => call === "delivery").length, 1);
    assert.ok(!f.events.some((event) => event.status === "SMTP_ACCEPTED"));
  });

test("arbitrary errors cannot inject text into safe diagnostic codes", () => {
  assert.deepEqual(safeSmtpError({
    code: "secret-password", response: "secret", command: "AUTH secret", responseCode: "535 secret",
  }), { smtpCode: "SMTP_FAILURE" });
  assert.deepEqual(safeSmtpError({ code: "EAUTH", responseCode: 535 }), { smtpCode: "EAUTH", responseCode: 535 });
});

test("actual CLI loads production .env, blocks duplicates, leaks no values and writes no settings", () => {
  const directory = mkdtempSync(join(tmpdir(), "lexradar-smtp-"));
  const contents = [
    "SMTP_HOST=smtp.mail.ru", "SMTP_PORT=465", "SMTP_USER=golwebstudio@bk.ru",
    "SMTP_PASS=first-test-secret", "SMTP_PASS=second-test-secret",
    "SMTP_FROM=golwebstudio@bk.ru", "MAIL_TO=golwebstudio@bk.ru",
    "LEXRADAR_FORM_ENABLED=false",
  ].join("\n");
  try {
    writeFileSync(join(directory, ".env.local"), contents);
    const loader = createRequire(import.meta.url).resolve("tsx");
    const script = fileURLToPath(new URL("../scripts/diagnose-smtp.ts", import.meta.url));
    const result = spawnSync(process.execPath, [
      "--import", pathToFileURL(loader).href, script, "--production-test",
    ], {
      cwd: directory,
      env: { PATH: process.env.PATH, NODE_ENV: "production" },
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(result.status, 1);
    const output = result.stdout + result.stderr;
    assert.ok(output.includes("DUPLICATE_ENV"));
    assert.ok(output.includes(".env.local"));
    assert.ok(!output.includes("first-test-secret"));
    assert.ok(!output.includes("second-test-secret"));
    assert.ok(!output.includes("SMTP_AUTH_OK"));
    assert.ok(!output.includes("SMTP_ACCEPTED"));
    assert.equal(readFileSync(join(directory, ".env.local"), "utf8"), contents);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
