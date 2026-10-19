import { getSmtpConfig, getLeadRecipient } from "./smtp-config";

export type LexradarConfig = {
  enabled: boolean;
  origin: string | null;
  abuseMode: "single-process" | "edge" | null;
  clientIpHeader: "x-real-ip" | "x-vercel-forwarded-for" | null;
  ready: boolean;
};

// Safe operator diagnostics: fixed codes only; never include environment values.
export function inspectLexradarReadiness(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  const config = getLexradarConfig(env);
  const blockers: string[] = [];
  if (!config.origin) blockers.push("SITE_ORIGIN_MISSING_OR_INVALID");
  if (!getSmtpConfig(env)) blockers.push("SMTP_CONFIG_INVALID");
  if (!getLeadRecipient(env)) blockers.push("RECIPIENT_CONFIG_INVALID");
  if (!config.abuseMode) blockers.push("ABUSE_MODE_MISSING_OR_INVALID");
  if (config.abuseMode === "edge") {
    if (!config.clientIpHeader) blockers.push("EDGE_TRUSTED_IP_HEADER_REQUIRED");
    if (env.LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED !== "true")
      blockers.push("EDGE_RATE_LIMIT_NOT_CONFIRMED");
  }
  return { ready: config.ready, enabled: config.enabled, blockers };
}

export function getLexradarConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): LexradarConfig {
  let origin: string | null = null;
  try {
    const url = new URL(env.LEXRADAR_SITE_ORIGIN || "");
    if (
      (url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    )
      origin = url.origin;
  } catch {
    /* Missing or invalid public origin keeps the form closed. */
  }
  const abuseMode =
    env.LEXRADAR_ABUSE_MODE === "single-process" ||
    env.LEXRADAR_ABUSE_MODE === "edge"
      ? env.LEXRADAR_ABUSE_MODE
      : null;
  const clientIpHeader =
    env.LEXRADAR_TRUST_PROXY === "true" &&
    (env.LEXRADAR_CLIENT_IP_HEADER === "x-real-ip" ||
      env.LEXRADAR_CLIENT_IP_HEADER === "x-vercel-forwarded-for")
      ? env.LEXRADAR_CLIENT_IP_HEADER
      : null;
  const smtpReady =
    Boolean(getSmtpConfig(env) && getLeadRecipient(env));
  const ready = Boolean(
    origin &&
    smtpReady &&
    abuseMode &&
    (abuseMode !== "edge" ||
      (clientIpHeader && env.LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED === "true")),
  );
  return {
    enabled: env.LEXRADAR_FORM_ENABLED === "true",
    origin,
    abuseMode,
    clientIpHeader,
    ready,
  };
}
