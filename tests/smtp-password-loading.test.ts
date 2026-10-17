import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, symlinkSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

function check(local: string, options: {
  env?: Record<string, string>;
  higher?: string;
} = {}) {
  const directory = mkdtempSync(join(tmpdir(), "lexradar-env-loading-"));
  try {
    symlinkSync(resolve("node_modules"), join(directory, "node_modules"), "dir");
    writeFileSync(join(directory, ".env.local"), local);
    if (options.higher !== undefined)
      writeFileSync(join(directory, ".env.production.local"), options.higher);
    writeFileSync(join(directory, "offline.cjs"),
      'require("node:net").Socket.prototype.connect = () => { throw Error("NETWORK_FORBIDDEN"); };');
    const before = readdirSync(directory);
    const child = spawnSync(process.execPath, [
      "--require", join(directory, "offline.cjs"), resolve("scripts/check-smtp-env.cjs"),
    ], {
      cwd: directory,
      env: { PATH: process.env.PATH, NODE_ENV: "production", ...options.env },
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(child.stderr, "");
    assert.equal(readFileSync(join(directory, ".env.local"), "utf8"), local);
    assert.deepEqual(readdirSync(directory), before);
    return { status: child.status, lines: child.stdout.trim().split("\n") };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const definition of [
  "SMTP_PASS=fixture-secret",
  'SMTP_PASS="fixture-secret"',
  "SMTP_PASS='fixture-secret'",
  'SMTP_PASS="fixture#secret"',
  "SMTP_PASS=' fixture-secret '",
  "SMTP_PASS=fixture\\$UNSET",
])
  test("literal or escaped password survives Next: " + definition.split("=")[0], () => {
    const result = check(definition);
    assert.equal(result.status, 0);
    assert.ok(result.lines.includes("LOCAL_DOTENV_SYNTAX_PRESERVED"));
    assert.ok(result.lines.includes("LOCAL_FILE_SELECTED"));
    // Removing the escape before $ is expected syntax, not password corruption.
    if (!definition.includes("\\$"))
      assert.ok(result.lines.includes("SELECTED_VALUE_NEXT_UNCHANGED"));
    else
      assert.ok(result.lines.includes("NEXT_CHANGE_EXPECTED_DOLLAR_ESCAPE_REMOVAL"));
    assert.ok(result.lines.includes("CHECK_COMPLETE_NO_NETWORK_NO_WRITES"));
    assert.ok(!result.lines.join("\n").includes("fixture"));
  });

for (const definition of [
  "SMTP_PASS=fixture$UNSET",
  'SMTP_PASS="fixture$UNSET"',
  "SMTP_PASS='fixture$UNSET'",
  "SMTP_PASS=fixture$" + "{UNSET}",
])
  test("Next expansion changes parsed password even inside quotes", () => {
    const result = check(definition);
    assert.equal(result.status, 0);
    assert.ok(result.lines.includes("SELECTED_VALUE_NEXT_CHANGED"));
    assert.ok(result.lines.includes("NEXT_CHANGE_BEYOND_DOLLAR_ESCAPES"));
    assert.ok(result.lines.includes("LOCAL_PARSED_DIFFERS_FROM_EFFECTIVE"));
    assert.ok(!result.lines.join("\n").includes("fixture"));
  });

for (const definition of [
  "SMTP_PASS=fixture#secret",
  "SMTP_PASS= fixture-secret ",
  'SMTP_PASS="fixture\\nsecret"',
])
  test("dotenv syntax transformation is separated from Next expansion", () => {
    const result = check(definition);
    assert.equal(result.status, 0);
    assert.ok(result.lines.includes("LOCAL_DOTENV_SYNTAX_TRANSFORMED"));
    assert.ok(result.lines.includes("SELECTED_VALUE_NEXT_UNCHANGED"));
    assert.ok(!result.lines.join("\n").includes("fixture"));
  });

test("process and higher-priority file overrides are not misreported as local expansion", () => {
  const inherited = check("SMTP_PASS=local-fixture", { env: { SMTP_PASS: "process-fixture" } });
  assert.ok(inherited.lines.includes("EFFECTIVE_SOURCE_PROCESS"));
  assert.ok(inherited.lines.includes("LOCAL_FILE_OVERRIDDEN"));
  assert.ok(inherited.lines.includes("SELECTED_VALUE_NEXT_UNCHANGED"));
  const higher = check("SMTP_PASS=local-fixture", { higher: "SMTP_PASS=higher-fixture" });
  assert.ok(higher.lines.includes("EFFECTIVE_SOURCE__ENV_PRODUCTION_LOCAL"));
  assert.ok(higher.lines.includes("LOCAL_FILE_OVERRIDDEN"));
});

test("Next can also expand an inherited password when a file defines the same key", () => {
  const result = check("SMTP_PASS=local-fixture", { env: { SMTP_PASS: "inherited$UNSET" } });
  assert.ok(result.lines.includes("EFFECTIVE_SOURCE_PROCESS"));
  assert.ok(result.lines.includes("SELECTED_VALUE_NEXT_CHANGED"));
});

test("duplicate, missing variable, alias conflict and nonproduction process are safe", () => {
  assert.deepEqual(check("SMTP_PASS=one\nSMTP_PASS=two").lines, ["CHECK_DUPLICATE_SMTP_PASS"]);
  assert.deepEqual(check("UNRELATED=fixture").lines, ["CHECK_LOCAL_SMTP_PASS_NOT_DEFINED"]);
  assert.ok(check("SMTP_PASS=one\nSMTP_PASSWORD=two").lines.includes("PASSWORD_ALIAS_CONFLICT"));
  assert.deepEqual(check("SMTP_PASS=fixture", { env: { NODE_ENV: "test" } }).lines,
    ["CHECK_REQUIRES_FRESH_PRODUCTION_PROCESS"]);
});
