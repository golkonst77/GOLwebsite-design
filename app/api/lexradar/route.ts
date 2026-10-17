import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { lexradarSchema } from "@/lib/lexradar-validation";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; until: number }>();
const fail = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, { status });

export async function POST(request: NextRequest) {
  // Reverse proxy must overwrite forwarded IP and enforce a request body limit.
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return fail("Недопустимый источник запроса.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return fail("Ожидается JSON.", 415);
  if (Number(request.headers.get("content-length")) > 16384)
    return fail("Слишком большая заявка.", 413);
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.until <= now) attempts.delete(key);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const entry = attempts.get(ip) || { count: 0, until: now + 600000 };
  if (entry.count >= 5 || (!attempts.has(ip) && attempts.size >= 10000))
    return fail("Слишком много попыток. Повторите через 10 минут.", 429);
  entry.count++;
  attempts.set(ip, entry);
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("Пустая заявка.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return fail("Слишком большая заявка.", 413);
      }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return fail("Не удалось прочитать заявку.", 400);
  }
  const parsed = lexradarSchema.safeParse(body);
  if (!parsed.success)
    return fail(
      "Проверьте адрес сайта, имя, email, телефон и согласие на обработку данных.",
      400,
    );
  if (parsed.data.company) return fail("Не удалось принять заявку.", 400);
  if (
    process.env.LEXRADAR_FORM_ENABLED !== "true" ||
    !process.env.YANDEX_EMAIL ||
    !process.env.YANDEX_PASSWORD
  )
    return fail(
      "Приём заявок временно недоступен. Напишите на golwebstudio@mail.ru.",
      503,
    );
  const { site, name, email, phone, comment, utm } = parsed.data;
  const text = [
    "LexRadar — бесплатная предварительная проверка",
    `Сайт: ${site}`,
    `Имя: ${name}`,
    `Email: ${email}`,
    `Телефон: ${phone || "не указан"}`,
    `Комментарий: ${comment || "не указан"}`,
    `UTM: ${JSON.stringify(utm || {})}`,
    "Согласие: lexradar-2026-10-17",
    `Дата согласия и заявки: ${new Date().toISOString()}`,
  ].join("\n");
  const html = `<pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}</pre>`;
  const result = await sendEmail({
    to: process.env.LEAD_TO_EMAIL?.trim() || "golwebstudio@mail.ru",
    subject: "[GØL] LexRadar — заявка на проверку",
    text,
    html,
    replyTo: email,
  });
  if (!result.success)
    return fail(
      "Не удалось отправить заявку. Попробуйте позже или напишите на golwebstudio@mail.ru.",
      502,
    );
  return NextResponse.json({ ok: true });
}
