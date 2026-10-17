import { loadEnvConfig } from "@next/env";
import nodemailer from "nodemailer";
import { z } from "zod";
import { smtpOptions } from "../lib/email-service";
import { getLexradarConfig } from "../lib/lexradar-config";

async function main() {
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const config = getLexradarConfig();
  const sender = z
    .string()
    .email()
    .safeParse(process.env.YANDEX_EMAIL?.trim()).success;
  const password = Boolean(process.env.YANDEX_PASSWORD?.trim());
  console.log(
    JSON.stringify(
      {
        senderConfigured: sender,
        passwordConfigured: password,
        recipientConfiguredOrDefault:
          !process.env.LEAD_TO_EMAIL ||
          z.string().email().safeParse(process.env.LEAD_TO_EMAIL.trim())
            .success,
        publicOriginConfigured: Boolean(config.origin),
        abuseModeConfigured: Boolean(config.abuseMode),
        lexradarReady: config.ready,
        formEnabled: config.enabled,
        sendsEmail: false,
      },
      null,
      2,
    ),
  );
  if (process.argv.includes("--verify")) {
    if (!sender || !password) {
      console.log("SMTP verification skipped: configuration missing.");
      process.exitCode = 1;
    } else {
      const transport = nodemailer.createTransport(smtpOptions());
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          transport.verify(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("TIMEOUT")), 20000);
          }),
        ]);
        console.log(
          "SMTP connection/authentication verified. No message sent; delivery is NOT confirmed.",
        );
      } catch {
        console.log(
          "SMTP connection/authentication failed. No message sent; secrets and transport details omitted.",
        );
        process.exitCode = 1;
      } finally {
        clearTimeout(timer);
        transport.close();
      }
    }
  }
}
void main().catch(() => {
  console.log("SMTP diagnostic could not complete; internal details omitted.");
  process.exitCode = 1;
});
