import { test } from "node:test";
import assert from "node:assert/strict";
import { getLexradarConfig, inspectLexradarReadiness } from "../lib/lexradar-config";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const base = {
  SMTP_HOST: "smtp.mail.ru", SMTP_USER: "test@example.invalid", SMTP_PASS: "mock-only",
  LEXRADAR_SITE_ORIGIN: "https://example.invalid", LEXRADAR_ABUSE_MODE: "single-process",
  LEXRADAR_FORM_ENABLED: "true",
};
test("readiness explains the old generic failure without exposing values", () => {
  const env = { ...base, LEXRADAR_SITE_ORIGIN: "https://private.invalid/lexradar", LEXRADAR_ABUSE_MODE: "" };
  const status = inspectLexradarReadiness(env);
  assert.deepEqual(status, { ready: false, enabled: true,
    blockers: ["SITE_ORIGIN_MISSING_OR_INVALID", "ABUSE_MODE_MISSING_OR_INVALID"] });
  assert.doesNotMatch(JSON.stringify(status), /private|mock-only|test@/);
  assert.equal(getLexradarConfig(env).ready, false);
});
test("readiness preserves every gate, with separate enabled flag and no Telegram dependency", () => {
  for (const patch of [
    {}, { LEXRADAR_FORM_ENABLED: "false" }, { SMTP_PASS: "" }, { MAIL_TO: "bad" },
    { LEXRADAR_SITE_ORIGIN: "" }, { LEXRADAR_ABUSE_MODE: "" },
    { LEXRADAR_ABUSE_MODE: "edge" },
    { LEXRADAR_ABUSE_MODE: "edge", LEXRADAR_TRUST_PROXY: "true", LEXRADAR_CLIENT_IP_HEADER: "x-real-ip" },
    { LEXRADAR_ABUSE_MODE: "edge", LEXRADAR_TRUST_PROXY: "true", LEXRADAR_CLIENT_IP_HEADER: "x-real-ip", LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED: "true" },
    { TELEGRAM_NOTIFICATIONS_ENABLED: "true", TELEGRAM_BOT_TOKEN: "invalid" },
  ]) {
    const env = { ...base, ...patch };
    const status = inspectLexradarReadiness(env);
    assert.equal(status.ready, getLexradarConfig(env).ready);
    assert.equal(status.ready, status.blockers.length === 0);
  }
  assert.deepEqual(inspectLexradarReadiness({ ...base, LEXRADAR_ABUSE_MODE: "edge" }).blockers,
    ["EDGE_TRUSTED_IP_HEADER_REQUIRED", "EDGE_RATE_LIMIT_NOT_CONFIRMED"]);
  assert.deepEqual(inspectLexradarReadiness({ ...base, LEXRADAR_FORM_ENABLED: "false" }),
    { ready: true, enabled: false, blockers: [] });
});
test("actual offline CLI loads production env, diagnoses blockers and leaves files unchanged", () => {
  const directory = mkdtempSync(join(tmpdir(), "lexradar-readiness-"));
  const script = fileURLToPath(new URL("../scripts/inspect-lexradar.ts", import.meta.url));
  const loader = pathToFileURL(createRequire(import.meta.url).resolve("tsx")).href;
  try {
    for (const patch of [{ LEXRADAR_ABUSE_MODE: "" }, {}, { LEXRADAR_FORM_ENABLED: "false" }]) {
      const contents = Object.entries({ ...base, ...patch }).map(([key, value]) => `${key}=${value}`).join("\n");
      const path = join(directory, ".env.local");
      writeFileSync(path, contents);
      const result = spawnSync(process.execPath, ["--import", loader, script], {
        cwd: directory, env: { PATH: process.env.PATH, NODE_ENV: "production" },
        encoding: "utf8", timeout: 10000,
      });
      const blocked = patch.LEXRADAR_ABUSE_MODE === "";
      assert.equal(result.status, blocked || patch.LEXRADAR_FORM_ENABLED === "false" ? 1 : 0);
      assert.match(result.stdout, /FORM_INSPECTION_ONLY_NO_NETWORK_NO_CHANGES/);
      if (blocked) assert.match(result.stdout, /FORM_BLOCKER_ABUSE_MODE_MISSING_OR_INVALID/);
      else assert.match(result.stdout, /FORM_READY/);
      assert.doesNotMatch(result.stdout + result.stderr, /mock-only|test@example|https:\/\/example/);
      assert.equal(readFileSync(path, "utf8"), contents);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
