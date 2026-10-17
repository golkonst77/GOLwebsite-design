import { z } from "zod";

type Environment = Readonly<Record<string, string | undefined>>;
export const SMTP_KEYS = [
  "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS",
  "SMTP_PASSWORD", "SMTP_FROM", "SMTP_AUTH_METHOD", "MAIL_TO", "LEAD_TO_EMAIL",
  "YANDEX_EMAIL", "YANDEX_PASSWORD",
] as const;
export function aliasConflict(env: Environment, first: string, second: string) {
  return env[first] !== undefined && env[second] !== undefined &&
    env[first] !== env[second];
}
export function getLeadRecipient(env: Environment = process.env): string | null {
  if (aliasConflict(env, "MAIL_TO", "LEAD_TO_EMAIL")) return null;
  const recipient = (env.MAIL_TO ?? env.LEAD_TO_EMAIL)?.trim();
  if (recipient === undefined) return "golwebstudio@bk.ru";
  return z.string().email().safeParse(recipient).success &&
    recipient.toLowerCase() === "golwebstudio@bk.ru" ? "golwebstudio@bk.ru" : null;
}
const email = z.string().email();
const clean = (value: string) => !/[\r\n\0]/.test(value);

// Legacy Yandex credentials are never used, even when generic SMTP is absent.
export function getSmtpConfig(env: Environment = process.env) {
  if (aliasConflict(env, "SMTP_PASS", "SMTP_PASSWORD")) return null;
  const host = env.SMTP_HOST?.trim() || "";
  const user = env.SMTP_USER?.trim() || "";
  // Passwords may contain meaningful leading/trailing spaces.
  const pass = (env.SMTP_PASS ?? env.SMTP_PASSWORD) || "";
  const from = env.SMTP_FROM?.trim() || user;
  const portText = env.SMTP_PORT?.trim() || "465";
  const port = Number(portText);
  const secureText = env.SMTP_SECURE?.trim();
  const authMethod = env.SMTP_AUTH_METHOD?.trim() || "LOGIN";
  if (
    host.toLowerCase() !== "smtp.mail.ru" ||
    !user || user.length > 254 || !clean(user) || !pass.trim() ||
    !email.safeParse(from).success || !clean(from) ||
    !/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535 ||
    (secureText !== undefined && secureText !== "true" && secureText !== "false") ||
    !["LOGIN", "PLAIN"].includes(authMethod)
  ) return null;
  const secure = secureText === undefined ? port === 465 : secureText === "true";
  // Avoid an accidental plaintext handshake on the implicit TLS port.
  if (port === 465 && !secure) return null;
  return {
    from,
    options: {
      host,
      port,
      secure,
      requireTLS: !secure,
      authMethod,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: { servername: host, minVersion: "TLSv1.2" as const, rejectUnauthorized: true },
      auth: { user, pass },
    },
  };
}
