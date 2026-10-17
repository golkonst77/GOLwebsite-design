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
  if (recipient === undefined) return "golwebstudio@mail.ru";
  return z.string().email().safeParse(recipient).success ? recipient : null;
}
const email = z.string().email();
const clean = (value: string) => !/[\r\n\0]/.test(value);

// Generic SMTP settings take precedence as a group. Never mix providers' secrets.
export function getSmtpConfig(env: Environment = process.env) {
  const generic = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_PASSWORD", "SMTP_FROM"]
    .some((key) => env[key] !== undefined);
  if (aliasConflict(env, "SMTP_PASS", "SMTP_PASSWORD")) return null;
  const host = generic ? env.SMTP_HOST?.trim() || "" : "2a02:6b8::19d";
  const user = (generic ? env.SMTP_USER : env.YANDEX_EMAIL)?.trim() || "";
  // Passwords may contain meaningful leading/trailing spaces.
  const pass = (generic ? env.SMTP_PASS ?? env.SMTP_PASSWORD : env.YANDEX_PASSWORD) || "";
  const from = (generic ? env.SMTP_FROM?.trim() || user : user);
  const portText = generic ? env.SMTP_PORT?.trim() || "587" : "587";
  const port = Number(portText);
  const secureText = generic ? env.SMTP_SECURE?.trim() : undefined;
  const yandex = !generic || host.toLowerCase() === "smtp.yandex.ru";
  const authMethod = env.SMTP_AUTH_METHOD?.trim() || (yandex ? "LOGIN" : undefined);
  if (
    !host || host.length > 253 || (generic && !/^[a-zA-Z0-9.-]+$/.test(host)) ||
    !user || user.length > 254 || !clean(user) || !pass.trim() ||
    !email.safeParse(from).success || !clean(from) ||
    !/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535 ||
    (secureText !== undefined && secureText !== "true" && secureText !== "false")
    || (authMethod !== undefined && authMethod !== "LOGIN" && authMethod !== "PLAIN")
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
      ...(authMethod ? { authMethod } : {}),
      ...(yandex ? { name: "www.golwebstudio.ru" } : {}),
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: { servername: generic ? host : "smtp.yandex.ru", minVersion: "TLSv1.2" as const, rejectUnauthorized: true },
      auth: { user, pass },
    },
  };
}
