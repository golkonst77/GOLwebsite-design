import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'

const DEFAULT_LEAD_TO = 'golwebstudio@mail.ru'
const EMPTY_MESSAGE_FALLBACK = 'Клиент не оставил описание задачи'
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function trimField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

function pruneRateLimitStore(now: number): void {
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(ip)
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  pruneRateLimitStore(now)

  const entry = rateLimitStore.get(ip)
  if (!entry || now >= entry.resetAt) {
    return false
  }

  return entry.count >= RATE_LIMIT_MAX
}

function recordSuccessfulSubmission(ip: string): void {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return
  }

  entry.count += 1
}

function buildSubject(name: string): string {
  const safeName = name.replace(/\s+/g, ' ').trim().slice(0, 80)
  return `[GØL] Новая заявка — ${safeName || 'Без имени'}`
}

function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function normalizeAndFormatPhone(
  contact: string,
): { ok: true; formatted: string } | { ok: false } {
  let digits = extractPhoneDigits(contact)

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  } else if (digits.length === 10) {
    digits = `7${digits}`
  }

  if (digits.length !== 11 || !digits.startsWith('7')) {
    return { ok: false }
  }

  const national = digits.slice(1)
  const formatted = `+7 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 8)}-${national.slice(8, 10)}`

  return { ok: true, formatted }
}

function buildEmailFooterHtml(): string {
  return `
          <tr>
            <td style="padding:28px 0 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 16px 0;font-size:18px;line-height:1;color:#d4af37;">&mdash;</p>
              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.5;letter-spacing:0.12em;text-transform:uppercase;color:#171717;font-weight:600;">G&Oslash;L Web Studio</p>
              <p style="margin:0 0 14px 0;font-size:13px;line-height:1.6;color:#6f6a62;">Чистый дизайн. Сильный результат.</p>
              <p style="margin:0;">
                <a href="https://golwebstudio.ru" style="font-size:13px;line-height:1.5;color:#9a7b2f;text-decoration:none;border-bottom:1px solid rgba(212,175,55,0.45);">https://golwebstudio.ru</a>
              </p>
            </td>
          </tr>
  `
}

function buildEmailShell(title: string, bodyRows: string): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f1ec;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#f3f1ec;">
    <tr>
      <td align="center" style="padding:32px 16px 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 24px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px 0;font-size:28px;line-height:1.1;letter-spacing:0.22em;color:#171717;font-weight:700;">G&Oslash;L</p>
              <p style="margin:0;font-size:11px;line-height:1.4;letter-spacing:0.28em;text-transform:uppercase;color:#8a8478;">Digital Design Studio</p>
            </td>
          </tr>
          ${bodyRows}
          ${buildEmailFooterHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function buildLeadEmailHtml({
  name,
  contact,
  message,
  sentAt,
  consentAt,
}: {
  name: string
  contact: string
  message: string
  sentAt: string
  consentAt: string
}): string {
  const displayMessage = message.trim() ? message : EMPTY_MESSAGE_FALLBACK
  const safeName = escapeHtml(name)
  const safeContact = escapeHtml(contact)
  const safeMessage = escapeHtml(displayMessage).replace(/\n/g, '<br>')
  const safeDate = escapeHtml(sentAt)
  const safeConsentAt = escapeHtml(consentAt)

  const fieldBlock = (label: string, value: string) => `
    <tr>
      <td style="padding:0 0 14px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e8e4dc;border-radius:12px;">
          <tr>
            <td style="padding:18px 20px 20px 20px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px 0;font-size:10px;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#8a8478;">${label}</p>
              <p style="margin:0;font-size:17px;line-height:1.55;color:#171717;font-weight:400;">${value}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  const bodyRows = `
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="height:1px;background-color:#d4af37;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:22px;line-height:1.35;color:#171717;font-weight:600;">Новая заявка с сайта G&Oslash;L</p>
            </td>
          </tr>
          ${fieldBlock('Имя', safeName)}
          ${fieldBlock('Контакт', safeContact)}
          ${fieldBlock('Задача', safeMessage)}
          <tr>
            <td style="padding:6px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#faf9f6;border:1px solid #e8e4dc;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 10px 0;font-size:10px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:#8a8478;">Дата</p>
                    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.5;color:#171717;">${safeDate}</p>
                    <p style="margin:0 0 6px 0;font-size:10px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:#8a8478;">Источник</p>
                    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.5;color:#171717;">gol.studio</p>
                    <p style="margin:0 0 6px 0;font-size:10px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:#8a8478;">Согласие на обработку ПД</p>
                    <p style="margin:0 0 6px 0;font-size:15px;line-height:1.5;color:#171717;">Получено</p>
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#6f6a62;">${safeConsentAt}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  `

  return buildEmailShell('Новая заявка — GØL', bodyRows)
}

function buildLeadEmailText({
  name,
  contact,
  message,
  sentAt,
  consentAt,
}: {
  name: string
  contact: string
  message: string
  sentAt: string
  consentAt: string
}): string {
  const displayMessage = message.trim() ? message : EMPTY_MESSAGE_FALLBACK

  return `
GØL — Digital Design Studio
Новая заявка с сайта GØL

Имя: ${name}
Контакт: ${contact}
Задача:
${displayMessage}

Дата: ${sentAt}
Источник: gol.studio
Согласие на обработку ПД: получено
Дата согласия: ${consentAt}

—
GØL Web Studio
Чистый дизайн. Сильный результат.
https://golwebstudio.ru
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    // 1. Прочитать body
    const body = await request.json()

    // 2. Honeypot
    const website = trimField(body?.website)
    if (website) {
      return NextResponse.json({ ok: true })
    }

    // 3. Согласие на обработку ПД
    if (body?.consent !== true) {
      return NextResponse.json({ ok: false, error: 'CONSENT_REQUIRED' }, { status: 400 })
    }

    // 4. Нормализация
    const name = trimField(body?.name)
    const contactRaw = trimField(body?.contact)
    const message = trimField(body?.message)

    const phoneResult = normalizeAndFormatPhone(contactRaw)
    if (!phoneResult.ok) {
      return NextResponse.json({ ok: false, error: 'INVALID_PHONE' }, { status: 400 })
    }

    const contact = phoneResult.formatted

    // 5. Валидация
    if (!name || !contact || !message) {
      return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR' }, { status: 400 })
    }

    if (name.length > 100 || contact.length > 150 || message.length > 2000) {
      return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR' }, { status: 400 })
    }

    // 6. Rate limit
    const clientIp = getClientIp(request)
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { ok: false, error: 'Слишком много отправок. Попробуйте позже.' },
        { status: 429 },
      )
    }

    const to = process.env.LEAD_TO_EMAIL?.trim() || DEFAULT_LEAD_TO
    const sentAt = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      dateStyle: 'long',
      timeStyle: 'short',
    })
    const consentAt = sentAt

    const subject = buildSubject(name)
    const html = buildLeadEmailHtml({ name, contact, message, sentAt, consentAt })
    const text = buildLeadEmailText({ name, contact, message, sentAt, consentAt })

    // 7. Письмо админу
    const adminResult = await sendEmail({
      to,
      subject,
      html,
      text,
    })

    if (!adminResult.success) {
      return NextResponse.json({ ok: false, error: 'SEND_FAILED' }, { status: 500 })
    }

    // 8. Успех + учёт rate limit
    recordSuccessfulSubmission(clientIp)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'BAD_REQUEST' }, { status: 500 })
  }
}
