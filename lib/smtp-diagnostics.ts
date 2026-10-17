import { SMTP_KEYS, aliasConflict, getLeadRecipient, getSmtpConfig } from "./smtp-config";
import { safeSmtpError } from "./smtp-errors";
import type { EmailResult } from "./email-service";

type Environment = Readonly<Record<string, string | undefined>>;
export const PRODUCTION_ENV_FILES = [".env.production.local", ".env.local", ".env.production", ".env"] as const;
type EnvSource = typeof PRODUCTION_ENV_FILES[number];
type FileInput = { name: EnvSource; contents: string };
type Definition = { key: string; source: EnvSource | "process"; empty: boolean };

// Scan assignments as dotenv does, including quoted multiline values. Values stay internal.
const assignment = /^\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*\x60(?:\\\x60|[^\x60])*\x60|[^#\r\n]+)?\s*(?:#.*)?$/gm;

export function auditSmtpEnvironment(
  files: readonly FileInput[],
  inherited: Environment,
  effective: Environment,
) {
  const definitions: Definition[] = [];
  const duplicates: { source: EnvSource; key: string }[] = [];
  const formatWarnings: { source: EnvSource; key: string; code: string }[] = [];
  const allowed = new Set<string>(SMTP_KEYS);
  for (const file of files) {
    const seen = new Set<string>();
    for (const match of file.contents.replace(/\r\n?/g, "\n").matchAll(assignment)) {
      const key = match[1];
      if (!allowed.has(key)) continue;
      if (seen.has(key)) duplicates.push({ source: file.name, key });
      seen.add(key);
      const raw = (match[2] || "").trim();
      const quoted = ["'", '"', String.fromCharCode(96)].includes(raw[0]) && raw.at(-1) === raw[0];
      const value = quoted ? raw.slice(1, -1) : raw;
      definitions.push({ source: file.name, key, empty: !value.trim() });
      if (["SMTP_PASS", "SMTP_PASSWORD", "YANDEX_PASSWORD"].includes(key)) {
        if (value.includes("$"))
          formatWarnings.push({ source: file.name, key, code: "CHECK_DOTENV_EXPANSION" });
        if (value !== value.trim())
          formatWarnings.push({ source: file.name, key, code: "CHECK_PASSWORD_WHITESPACE" });
        if (!quoted && match[0].includes("#"))
          formatWarnings.push({ source: file.name, key, code: "CHECK_UNQUOTED_COMMENT" });
      }
    }
  }
  for (const key of SMTP_KEYS)
    if (inherited[key] !== undefined)
      definitions.unshift({ source: "process", key, empty: !inherited[key]?.trim() });
  const shadowedKeys = SMTP_KEYS.filter((key) =>
    definitions.filter((item) => item.key === key).length > 1);
  const conflicts = [
    ["SMTP_PASS", "SMTP_PASSWORD"], ["MAIL_TO", "LEAD_TO_EMAIL"],
  ].filter(([first, second]) => aliasConflict(effective, first, second));
  const variables = SMTP_KEYS.map((key) => ({
    key,
    status: effective[key] === undefined ? "MISSING" :
      effective[key]?.trim() ? "SET" : "EMPTY",
    source: definitions.find((item) => item.key === key)?.source || null,
  }));
  return { variables, definitions, duplicates, shadowedKeys, conflicts, formatWarnings };
}

type Stage = "configuration" | "connection" | "authentication" | "delivery";
export type DiagnosticEvent = {
  stage: Stage;
  status: string;
  smtpCode?: string;
  responseCode?: number;
};

// All network operations are supplied by the CLI; tests cannot accidentally send mail.
export async function runSmtpDiagnostic({
  env, duplicateCount, mode, probe, verify, send, emit,
}: {
  env: Environment;
  duplicateCount: number;
  mode: "inspect" | "verify" | "production-test";
  probe: () => Promise<void>;
  verify: () => Promise<void>;
  send: () => Promise<EmailResult>;
  emit: (event: DiagnosticEvent) => void;
}): Promise<boolean> {
  if (duplicateCount || !getSmtpConfig(env) || !getLeadRecipient(env)) {
    emit({ stage: "configuration", status: duplicateCount ? "DUPLICATE_ENV" : "INVALID_ENV" });
    return false;
  }
  // Production test is intentionally pinned to the requested sender and recipient.
  const config = getSmtpConfig(env)!;
  if (mode === "production-test" && (
    config.options.host !== "smtp.mail.ru" || config.options.port !== 465 ||
    !config.options.secure || config.options.auth.user !== "golwebstudio@bk.ru" ||
    config.from !== "golwebstudio@bk.ru" || getLeadRecipient(env) !== "golwebstudio@bk.ru"
  )) {
    emit({ stage: "configuration", status: "MAILRU_TARGET_MISMATCH" });
    return false;
  }
  emit({ stage: "configuration", status: "CONFIG_OK" });
  if (mode === "inspect") return true;
  let stage: Stage = "connection";
  try {
    await probe();
    emit({ stage, status: "CONNECTION_OK" });
    stage = "authentication";
    await verify();
    emit({ stage, status: "SMTP_AUTH_OK" });
    if (mode === "verify") return true;
    stage = "delivery";
    const outcome = await send();
    emit({
      stage,
      status: outcome.success ? "SMTP_ACCEPTED" :
        outcome.uncertain ? "DELIVERY_UNCONFIRMED" : "SEND_FAILED",
      ...(outcome.smtpCode ? { smtpCode: outcome.smtpCode } : {}),
      ...(outcome.responseCode ? { responseCode: outcome.responseCode } : {}),
    });
    return outcome.success;
  } catch (cause) {
    emit({ stage, status: "FAILED", ...safeSmtpError(cause) });
    return false;
  }
}
