"use strict";

// Offline, read-only. Fixed statuses only; no values, sizes, hashes or snippets.
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const print = (status) => process.stdout.write(status + "\n");

function main() {
  const localRequire = createRequire(path.join(process.cwd(), "package.json"));
  // Lexical rules below match the dotenv parser bundled in this exact version.
  if (localRequire("@next/env/package.json").version !== "16.4.2") {
    print("CHECK_UNSUPPORTED_NEXT_ENV_VERSION");
    process.exitCode = 2;
    return;
  }
  if (process.env.NODE_ENV === "test" || process.env.__NEXT_PROCESSED_ENV) {
    print("CHECK_REQUIRES_FRESH_PRODUCTION_PROCESS");
    process.exitCode = 2;
    return;
  }
  const names = [".env.production.local", ".env.local", ".env.production", ".env"];
  const assignment = /^\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*\x60(?:\\\x60|[^\x60])*\x60|[^#\r\n]+)?\s*(?:#.*)?$/gm;
  const files = [];
  let duplicate = false;
  for (const name of names) {
    let contents;
    try {
      if (!fs.statSync(name).isFile()) throw new Error();
      contents = fs.readFileSync(name, "utf8");
    } catch (error) {
      if (error && error.code === "ENOENT") continue;
      throw new Error();
    }
    const parsed = Object.create(null);
    let literal;
    const seen = new Set();
    for (const match of contents.replace(/\r\n?/g, "\n").matchAll(assignment)) {
      const key = match[1];
      const token = (match[2] || "").trim();
      const quote = token[0];
      const quoted = ["'", '"', String.fromCharCode(96)].includes(quote) && token.at(-1) === quote;
      let value = quoted ? token.slice(1, -1) : token;
      if (key === "SMTP_PASS") {
        if (seen.has(key)) duplicate = true;
        if (quoted) {
          literal = value; // Ignore syntactic delimiters and comments after them.
        } else {
          const header = match[0].match(/^\s*(?:export\s+)?[\w.-]+(?:\s*=\s*?|:\s+?)/);
          literal = match[0].slice(header[0].length).replace(/(?:\n[ \t]*)+$/, "");
        }
      }
      if (quote === '"') value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
      parsed[key] = value;
      seen.add(key);
    }
    files.push({ name, contents, parsed, literal });
  }
  if (duplicate) {
    print("CHECK_DUPLICATE_SMTP_PASS");
    process.exitCode = 2;
    return;
  }
  const local = files.find((file) => file.name === ".env.local");
  if (!local || local.parsed.SMTP_PASS === undefined) {
    print("CHECK_LOCAL_SMTP_PASS_NOT_DEFINED");
    process.exitCode = 2;
    return;
  }
  const inheritedPass = process.env.SMTP_PASS;
  const selected = files.find((file) => file.parsed.SMTP_PASS !== undefined);
  const source = inheritedPass !== undefined ? "PROCESS" : selected.name;
  const before = inheritedPass !== undefined ? inheritedPass : selected.parsed.SMTP_PASS;
  let failed = false;
  const { loadEnvConfig } = localRequire("@next/env");
  const loaded = loadEnvConfig(process.cwd(), false, {
    info() {},
    error() { failed = true; },
  });
  if (failed) throw new Error();
  if (files.length !== loaded.loadedEnvFiles.length || files.some((file) => {
    const actual = loaded.loadedEnvFiles.find((entry) => entry.path === file.name);
    return !actual || file.contents !== actual.contents;
  })) {
    print("CHECK_FILES_CHANGED_DURING_READ");
    process.exitCode = 2;
    return;
  }
  const effective = loaded.combinedEnv.SMTP_PASS;
  if (effective === undefined) throw new Error();
  print(local.literal === local.parsed.SMTP_PASS
    ? "LOCAL_DOTENV_SYNTAX_PRESERVED" : "LOCAL_DOTENV_SYNTAX_TRANSFORMED");
  print("EFFECTIVE_SOURCE_" + (source === "PROCESS"
    ? "PROCESS" : source.replace(/\./g, "_").toUpperCase()));
  print(source === ".env.local" ? "LOCAL_FILE_SELECTED" : "LOCAL_FILE_OVERRIDDEN");
  print(before === effective ? "SELECTED_VALUE_NEXT_UNCHANGED" : "SELECTED_VALUE_NEXT_CHANGED");
  if (before !== effective)
    print(before.replace(/\\\$/g, "$") === effective
      ? "NEXT_CHANGE_EXPECTED_DOLLAR_ESCAPE_REMOVAL" : "NEXT_CHANGE_BEYOND_DOLLAR_ESCAPES");
  print(local.parsed.SMTP_PASS === effective
    ? "LOCAL_PARSED_MATCHES_EFFECTIVE" : "LOCAL_PARSED_DIFFERS_FROM_EFFECTIVE");
  if (loaded.combinedEnv.SMTP_PASSWORD !== undefined &&
      loaded.combinedEnv.SMTP_PASSWORD !== effective)
    print("PASSWORD_ALIAS_CONFLICT");
  print("CHECK_COMPLETE_NO_NETWORK_NO_WRITES");
}

try {
  main();
} catch {
  print("CHECK_FAILED_NO_DETAILS");
  process.exitCode = 2;
}
