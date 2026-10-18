import { CONSENT_VERSION } from "./lexradar-constants";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { getLexradarConfig, type LexradarConfig } from "./lexradar-config";
import { lexradarSchema } from "./lexradar-validation";
import { sendEmail } from "./email-service";
import { notifyAcceptedLead } from "./telegram-notifications";
import { getLeadRecipient } from "./smtp-config";

type Outcome = { status: number; code: string; ok: boolean };
type Delivery = { hash: string; until: number; result: Promise<Outcome> };
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const response = ({ status, code, ok }: Outcome) =>
  NextResponse.json(
    { ok, code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "600" } : {}),
      },
    },
  );
const result = (status: number, code: string): Outcome => ({
  status,
  code,
  ok: status === 200,
});

// The factory lets tests exercise the actual handler with a mock transport, not a rewritten API.
export function createLexradarHandler({
  send = sendEmail,
  notify = notifyAcceptedLead,
  config = getLexradarConfig,
  now = Date.now,
  readTimeout = 10000,
}: {
  send?: typeof sendEmail;
  notify?: typeof notifyAcceptedLead;
  config?: () => LexradarConfig;
  now?: () => number;
  readTimeout?: number;
} = {}) {
  const attempts = new Map<string, { count: number; until: number }>();
  const deliveries = new Map<string, Delivery>();
  return async function POST(request: NextRequest) {
    const settings = config();
    if (!settings.enabled || !settings.ready || !settings.origin)
      return response(result(503, "UNAVAILABLE"));
    if (
      request.headers.get("origin") !== settings.origin ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      return response(result(403, "ORIGIN"));
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        request.headers.get("content-type") || "",
      )
    )
      return response(result(415, "CONTENT_TYPE"));
    const length = request.headers.get("content-length");
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > 16384))
      return response(result(413, "BODY_SIZE"));
    let ip = "shared";
    if (settings.clientIpHeader) {
      const trustedIp =
        request.headers.get(settings.clientIpHeader)?.trim() || "";
      if (!isIP(trustedIp)) return response(result(400, "CLIENT_ADDRESS"));
      ip = digest(trustedIp);
    }
    const time = now();
    for (const [key, value] of attempts)
      if (value.until <= time) attempts.delete(key);
    for (const [key, value] of deliveries)
      if (value.until <= time) deliveries.delete(key);
    const entry = attempts.get(ip) || { count: 0, until: time + 600000 };
    if (entry.count >= 5 || (!attempts.has(ip) && attempts.size >= 10000))
      return response(result(429, "RATE_LIMIT"));
    entry.count++;
    attempts.set(ip, entry);
    const reader = request.body?.getReader();
    if (!reader) return response(result(400, "INVALID_BODY"));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let body: unknown;
    try {
      const read = async () => {
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 16384) {
            void reader.cancel().catch(() => {});
            return { oversized: true as const };
          }
          chunks.push(value);
        }
        return {
          oversized: false as const,
          text: Buffer.concat(chunks).toString("utf8"),
        };
      };
      const data = await Promise.race([
        read(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            void reader.cancel().catch(() => {});
            reject(new Error("READ_TIMEOUT"));
          }, readTimeout);
        }),
      ]);
      if (data.oversized) return response(result(413, "BODY_SIZE"));
      body = JSON.parse(data.text);
    } catch {
      return response(result(400, "INVALID_BODY"));
    } finally {
      clearTimeout(timer);
    }
    const parsed = lexradarSchema.safeParse(body);
    if (!parsed.success || parsed.data.company)
      return response(result(400, "VALIDATION"));
    const { requestId, ...data } = parsed.data;
    const key = digest(requestId);
    const hash = digest(JSON.stringify(data));
    const existing = deliveries.get(key);
    if (existing)
      return response(
        existing.hash === hash
          ? await existing.result
          : result(409, "REQUEST_CHANGED"),
      );
    if (deliveries.size >= 5000) return response(result(503, "UNAVAILABLE"));
    const deliver = async (): Promise<Outcome> => {
      const recipient = getLeadRecipient();
      if (!recipient) return result(503, "UNAVAILABLE");
      const { site, name, email, phone, comment, utm } = data;
      const text = [
        "LexRadar — бесплатная предварительная проверка",
        `Идентификатор заявки: ${requestId}`,
        `Сайт: ${site}`,
        `Имя: ${name}`,
        `Email: ${email}`,
        `Телефон: ${phone || "не указан"}`,
        `Комментарий: ${comment || "не указан"}`,
        `UTM: ${JSON.stringify(utm || {})}`,
        `Согласие: ${CONSENT_VERSION}`,
        `Дата согласия и заявки: ${new Date(now()).toISOString()}`,
      ].join("\n");
      const html = `<pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}</pre>`;
      try {
        const sent = await send({
          to: recipient,
          subject: "[GØL] LexRadar — заявка на проверку",
          text,
          html,
          replyTo: email,
        });
        if (sent.success && !sent.uncertain) {
          try { await notify({ form: "lexradar", requestId }); }
          catch { /* Notification failure must not change accepted email or API response. */ }
        }
        return sent.success
          ? result(200, "ACCEPTED")
          : result(
              sent.uncertain ? 504 : 502,
              sent.uncertain ? "DELIVERY_UNCONFIRMED" : "SEND_FAILED",
            );
      } catch {
        return result(504, "DELIVERY_UNCONFIRMED");
      }
    };
    // Store before awaiting. Concurrent retries share one send and one outcome for 30 minutes.
    const pending = deliver();
    deliveries.set(key, { hash, until: time + 1800000, result: pending });
    return response(await pending);
  };
}
