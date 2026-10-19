export const CONSENT_VERSION = "lexradar-2026-10-19-v4";
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;
export function collectUtm(search: string) {
  const source = new URLSearchParams(search);
  return Object.fromEntries(
    UTM_KEYS.flatMap((key) =>
      source.has(key) ? [[key, (source.get(key) || "").slice(0, 200)]] : [],
    ),
  );
}
