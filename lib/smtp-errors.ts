const codes = new Set([
  "EAUTH", "ECONNECTION", "ETIMEDOUT", "ECONNREFUSED", "ECONNRESET",
  "ENOTFOUND", "EAI_AGAIN", "EDNS", "ESOCKET", "ETLS", "EPROTOCOL",
  "EENVELOPE", "EMESSAGE", "SMTP_TIMEOUT", "CERT_HAS_EXPIRED",
  "DEPTH_ZERO_SELF_SIGNED_CERT", "ERR_TLS_CERT_ALTNAME_INVALID",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
]);

// Never return message, response, command, address or arbitrary error.code.
export function safeSmtpError(cause: unknown): { smtpCode: string; responseCode?: number } {
  const value = cause && typeof cause === "object"
    ? cause as { code?: unknown; responseCode?: unknown } : {};
  const smtpCode = typeof value.code === "string" && codes.has(value.code)
    ? value.code : "SMTP_FAILURE";
  const responseCode = typeof value.responseCode === "number" &&
    Number.isInteger(value.responseCode) && value.responseCode >= 400 &&
    value.responseCode <= 599 ? value.responseCode : undefined;
  return { smtpCode, ...(responseCode === undefined ? {} : { responseCode }) };
}
