import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { connect as connectTcp } from "node:net";
import { connect as connectTls } from "node:tls";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "../lib/email-service";
import { getLexradarConfig } from "../lib/lexradar-config";
import { getLeadRecipient, getSmtpConfig } from "../lib/smtp-config";
import { PRODUCTION_ENV_FILES, auditSmtpEnvironment, runSmtpDiagnostic } from "../lib/smtp-diagnostics";

const print = (value: object) => console.log(JSON.stringify(value));
const timeoutError = () => Object.assign(new Error(), { code: "ETIMEDOUT" });

async function probeServer(options: NonNullable<ReturnType<typeof getSmtpConfig>>["options"]) {
  await new Promise<void>((resolve, reject) => {
    // TLS on 465 validates the certificate before declaring the connection ready.
    // For STARTTLS, the following Nodemailer verify performs TLS negotiation.
    const socket = options.secure
      ? connectTls({ host: options.host, port: options.port, ...options.tls, rejectUnauthorized: true })
      : connectTcp({ host: options.host, port: options.port });
    const timer = setTimeout(() => finish(timeoutError()), 10000);
    function finish(error?: Error) {
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    }
    socket.once(options.secure ? "secureConnect" : "connect", () => finish());
    socket.once("error", finish);
  });
}

async function verifyServer(options: NonNullable<ReturnType<typeof getSmtpConfig>>["options"]) {
  const transport = nodemailer.createTransport(options);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      transport.verify(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(timeoutError()), 20000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    transport.close();
  }
}

async function main() {
  const flags = process.argv.slice(2);
  if (flags.some((flag) => !["--verify", "--production-test", "--send-test"].includes(flag)) ||
      process.env.NODE_ENV === "test") {
    print({ status: "INVALID_ARGUMENT_OR_ENV_MODE" });
    process.exitCode = 1;
    return;
  }
  // Only explicit files used by Next's production loader; never history, logs or backups.
  const files = [];
  for (const name of PRODUCTION_ENV_FILES) {
    try {
      files.push({ name, contents: await readFile(name, "utf8") });
    } catch (cause) {
      if (!(cause && typeof cause === "object" && "code" in cause && cause.code === "ENOENT"))
        throw new Error("ENV_READ_FAILED");
    }
  }
  const inherited = { ...process.env };
  let loadFailed = false;
  loadEnvConfig(process.cwd(), false, {
    info() {},
    error() { loadFailed = true; },
  });
  if (loadFailed) throw new Error("ENV_LOAD_FAILED");
  const audit = auditSmtpEnvironment(files, inherited, process.env);
  const form = getLexradarConfig();
  const mode = flags.includes("--production-test") || flags.includes("--send-test")
    ? "production-test" : flags.includes("--verify") ? "verify" : "inspect";
  print({
    status: "ENV_AUDIT",
    ...audit,
    formEnabled: form.enabled,
    formReady: form.ready,
    productionSettingsChanged: false,
    sendTestRequested: mode === "production-test",
  });
  const smtp = getSmtpConfig();
  const success = await runSmtpDiagnostic({
    env: process.env,
    duplicateCount: audit.duplicates.length,
    mode,
    probe: () => probeServer(smtp!.options),
    verify: () => verifyServer(smtp!.options),
    send: async () => {
      const id = randomUUID();
      const text = [
        "LexRadar — production SMTP test",
        "Test ID: " + id,
        "UTC: " + new Date().toISOString(),
        "Synthetic diagnostic message. Confirm inbox receipt before enabling the form.",
      ].join("\n");
      const result = await sendEmail({
        to: getLeadRecipient()!,
        subject: "[GØL] LexRadar — SMTP TEST",
        text,
        html: "<pre>" + text + "</pre>",
      });
      print({ status: "TEST_REFERENCE", testId: id, inboxReceiptConfirmed: false });
      return result;
    },
    emit: print,
  });
  print({
    status: success ? "DIAGNOSTIC_OK" : "DIAGNOSTIC_FAILED",
    inboxReceiptConfirmed: false,
    productionSettingsChanged: false,
  });
  if (!success) process.exitCode = 1;
}

void main().catch(() => {
  print({ status: "DIAGNOSTIC_FAILED", code: "LOCAL_DIAGNOSTIC_ERROR", productionSettingsChanged: false });
  process.exitCode = 1;
});
