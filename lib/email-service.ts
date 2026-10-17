import nodemailer from "nodemailer";

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
  sendMail: (options: nodemailer.SendMailOptions) => Promise<Receipt>;
  close: () => void;
};

export function smtpOptions(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  return {
    host: "2a02:6b8::19d",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { servername: "smtp.yandex.ru" },
    auth: {
      user: env.YANDEX_EMAIL?.trim() || "",
      pass: env.YANDEX_PASSWORD?.trim() || "",
    },
  };
}

export function createEmailSender({
  makeTransport = () => nodemailer.createTransport(smtpOptions()),
  env = () => process.env,
  timeoutMs = 20000,
}: {
  makeTransport?: () => MailTransport;
  env?: () => Readonly<Record<string, string | undefined>>;
  timeoutMs?: number;
} = {}) {
  return async function sendEmail(input: EmailInput): Promise<EmailResult> {
    const settings = env();
    if (!settings.YANDEX_EMAIL?.trim() || !settings.YANDEX_PASSWORD?.trim())
      return { success: false, error: "EMAIL_NOT_CONFIGURED" };
    if (
      !input.to ||
      !input.subject ||
      /[\r\n]/.test(input.to + input.subject + (input.replyTo || ""))
    )
      return { success: false, error: "EMAIL_INVALID" };
    let transport: MailTransport | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      transport = makeTransport();
      const activeTransport = transport;
      const delivery = activeTransport
        .sendMail({
          from: `"GØL Web Studio" <${settings.YANDEX_EMAIL.trim()}>`,
          ...input,
          text: input.text || input.html.replace(/<[^>]*>/g, ""),
          encoding: "utf-8",
        })
        .then((receipt): EmailResult =>
          receipt.accepted?.length && !receipt.rejected?.length
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
