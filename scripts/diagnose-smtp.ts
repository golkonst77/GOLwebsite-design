import { loadEnvConfig } from "@next/env";
import nodemailer from "nodemailer";
import { z } from "zod";
import { smtpOptions, sendEmail } from "../lib/email-service";
import { randomUUID } from "node:crypto";
import { getLexradarConfig } from "../lib/lexradar-config";
import { getSmtpConfig } from "../lib/smtp-config";

async function main() {
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const config = getLexradarConfig();
  const smtp = getSmtpConfig();
  console.log(
    JSON.stringify(
      {
        smtpConfigured: Boolean(smtp),
        recipientConfiguredOrDefault:
          !process.env.LEAD_TO_EMAIL ||
          z.string().email().safeParse(process.env.LEAD_TO_EMAIL.trim())
            .success,
        publicOriginConfigured: Boolean(config.origin),
        abuseModeConfigured: Boolean(config.abuseMode),
        lexradarReady: config.ready,
        formEnabled: config.enabled,
        sendsEmail: process.argv.includes("--send-test"),
      },
      null,
      2,
    ),
  );
  if (process.argv.includes("--send-test")) {
    if (!smtp) {
      console.log("SMTP test skipped: configuration missing. Form switch unchanged.");
      process.exitCode = 1;
      return;
    }
    const id = randomUUID();
    const text = `LexRadar SMTP TEST\nTest ID: ${id}\nTime: ${new Date().toISOString()}\nSynthetic diagnostic message; no visitor data.\nConfirm receipt in the destination mailbox before enabling the production form.`;
    const sent = await sendEmail({
      to: process.env.LEAD_TO_EMAIL?.trim() || "golwebstudio@mail.ru",
      subject: "[GØL] LexRadar — SMTP TEST",
      text,
      html: `<pre>${text}</pre>`,
    });
    console.log(sent.success
      ? `SMTP accepted the test message. Test ID: ${id}. Inbox receipt must still be checked. Form switch unchanged.`
      : "SMTP acceptance NOT confirmed. Check the mailbox before retrying. Form switch unchanged.");
    if (!sent.success) process.exitCode = 1;
    return;
  }
  if (process.argv.includes("--verify")) {
    if (!smtp) {
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
