import nodemailer, { type SendMailOptions } from "nodemailer";
import { getSmtpConfig } from "./smtp-config";
import { z } from "zod";

export type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
  replyTo?: string;
};
export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  uncertain?: boolean;
};
type Receipt = {
  accepted?: readonly unknown[];
  rejected?: readonly unknown[];
  messageId?: string;
};
export type MailTransport = {
  sendMail: (options: SendMailOptions) => Promise<Receipt>;
  close: () => void;
};

export function smtpOptions(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  const config = getSmtpConfig(env);
  if (!config) throw new Error("EMAIL_NOT_CONFIGURED");
  return config.options;
}

export function createEmailSender({
  makeTransport,
  env = () => process.env,
  timeoutMs = 20000,
}: {
  makeTransport?: () => MailTransport;
  env?: () => Readonly<Record<string, string | undefined>>;
  timeoutMs?: number;
} = {}) {
  return async function sendEmail(input: EmailInput): Promise<EmailResult> {
    const settings = env();
    const config = getSmtpConfig(settings);
    if (!config)
      return { success: false, error: "EMAIL_NOT_CONFIGURED" };
    if (
      !z.string().email().safeParse(input.to).success ||
      (input.replyTo !== undefined && !z.string().email().safeParse(input.replyTo).success) ||
      !input.subject ||
      /[\r\n]/.test(input.to + input.subject + (input.replyTo || ""))
    )
      return { success: false, error: "EMAIL_INVALID" };
    let transport: MailTransport | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      transport = makeTransport
        ? makeTransport()
        : nodemailer.createTransport(config.options);
      const activeTransport = transport;
      const delivery = activeTransport
        .sendMail({
          ...input,
          from: `"GØL Web Studio" <${config.from}>`,
          text: input.text || input.html.replace(/<[^>]*>/g, ""),
          encoding: "utf-8",
        })
        .then((receipt): EmailResult =>
          receipt.accepted?.some(
            (address) => typeof address === "string" &&
              address.toLowerCase() === input.to.toLowerCase(),
          ) && !receipt.rejected?.length
            ? { success: true, messageId: receipt.messageId }
            : { success: false, error: "SMTP_REJECTED" },
        );
      const timeout = new Promise<EmailResult>((resolve) => {
        timer = setTimeout(
          () =>
            resolve({ success: false, error: "SMTP_TIMEOUT", uncertain: true }),
          timeoutMs,
        );
      });
      return await Promise.race([delivery, timeout]);
    } catch (cause) {
      // Never expose raw SMTP text, addresses, credentials or server responses.
      const definitive =
        typeof cause === "object" &&
        cause !== null &&
        "code" in cause &&
        ["EAUTH", "EENVELOPE", "EMESSAGE"].includes(String(cause.code));
      return {
        success: false,
        error: "SMTP_SEND_FAILED",
        uncertain: !definitive,
      };
    } finally {
      clearTimeout(timer);
      try {
        transport?.close();
      } catch {
        /* Closing must not replace a delivery result. */
      }
    }
  };
}

export const sendEmail = createEmailSender();
