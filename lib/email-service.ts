import nodemailer from 'nodemailer'

type EmailAttachment = {
  filename: string
  content: string | Buffer
  contentType?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  replyTo?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!to || !subject) {
      throw new Error('Missing required fields: to, subject')
    }

    const yandexEmail = process.env.YANDEX_EMAIL?.trim()
    const yandexPassword = process.env.YANDEX_PASSWORD?.trim()

    if (!yandexEmail || !yandexPassword) {
      throw new Error('EMAIL_NOT_CONFIGURED')
    }

    return await sendViaYandex({
      to,
      subject,
      html,
      text,
      attachments,
      replyTo,
      email: yandexEmail,
      password: yandexPassword,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

async function sendViaYandex({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
  email,
  password,
}: {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  replyTo?: string
  email: string
  password: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = nodemailer.createTransport({
    host: '2a02:6b8::19d',
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: 'smtp.yandex.ru',
    },
    auth: {
      user: email,
      pass: password,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"GØL Web Studio" <${email}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      encoding: 'utf-8',
      ...(replyTo ? { replyTo } : {}),
      ...(attachments?.length
        ? {
            attachments: attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
              contentType: a.contentType,
            })),
          }
        : {}),
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'SMTP_SEND_FAILED'
    return {
      success: false,
      error: errorMessage,
    }
  }
}
