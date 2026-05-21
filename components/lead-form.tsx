'use client'

import { useState, type FormEvent } from 'react'

interface LeadFormProps {
  variant?: 'default' | 'compact' | 'inline' | 'contact'
  className?: string
}

const SUBMIT_ERROR_MESSAGE =
  'Не получилось отправить форму. Напишите напрямую: golwebstudio@mail.ru или @teodor77.'

/** bg-neon-green не в theme — без hex-кнопка невидима на тёмном фоне */
const GOLD_SUBMIT_BUTTON_CLASS =
  'w-full min-h-[56px] rounded-full border border-[#d8b63f]/80 bg-[#d8b63f] px-8 text-sm font-semibold tracking-[0.14em] uppercase text-black opacity-100 shadow-[0_18px_50px_rgba(212,175,55,0.22)] transition-all duration-300 ease-out hover:bg-[#e4c55e] hover:border-[#e4c55e]/80 hover:shadow-[0_22px_58px_rgba(212,175,55,0.32)] active:translate-y-0 supports-[hover:hover]:hover:-translate-y-[1px] disabled:cursor-wait disabled:opacity-80'

function HoneypotField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <input
      type="text"
      name="website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] h-px w-px opacity-0 pointer-events-none"
    />
  )
}

function SubmitError({ message }: { message: string }) {
  return <p className="mt-3 text-center text-sm text-red-400 leading-relaxed">{message}</p>
}

export default function LeadForm({ variant = 'default', className = '' }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  })
  const [website, setWebsite] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const clearSubmitError = () => {
    setSubmitError(null)
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    clearSubmitError()
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateWebsite = (value: string) => {
    clearSubmitError()
    setWebsite(value)
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void handleSubmit()
  }

  const handleSubmit = async () => {
    clearSubmitError()
    setIsSubmitting(true)

    try {
      const name = formData.name.trim() || (variant === 'inline' ? 'Не указано' : '')
      const contact = formData.contact.trim()
      const message =
        formData.message.trim() ||
        (variant === 'inline' ? 'Короткая заявка с сайта' : '')

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          contact,
          message,
          website,
        }),
      })

      if (!response.ok) {
        setSubmitError(SUBMIT_ERROR_MESSAGE)
        return
      }

      const data = (await response.json()) as { ok?: boolean }

      if (data.ok === true) {
        clearSubmitError()
        setFormData({ name: '', contact: '', message: '' })
        setWebsite('')
        setIsSubmitted(true)
        return
      }

      setSubmitError(SUBMIT_ERROR_MESSAGE)
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    const successClass =
      variant === 'contact'
        ? `rounded-2xl border border-gold/25 bg-gold/5 p-8 text-center ${className}`
        : `p-8 border border-neon-green/30 bg-neon-green/5 text-center ${className}`

    return (
      <div className={successClass}>
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            variant === 'contact' ? 'bg-gold/15 border border-gold/25' : 'bg-neon-green/20'
          }`}
        >
          <svg
            className={`h-8 w-8 ${variant === 'contact' ? 'text-gold' : 'text-neon-green'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">Заявка отправлена</h3>
        <p className="text-muted-foreground">
          Спасибо. Заявка отправлена — ответим в течение дня.
        </p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={onFormSubmit} className={`relative flex flex-col sm:flex-row gap-4 ${className}`}>
        <HoneypotField value={website} onChange={updateWebsite} />
        <input
          type="text"
          placeholder="Телефон или Telegram"
          value={formData.contact}
          onChange={(e) => updateField('contact', e.target.value)}
          required
          className="flex-1 px-6 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${GOLD_SUBMIT_BUTTON_CLASS} sm:w-auto sm:min-w-[200px]`}
        >
          {isSubmitting ? 'Отправка...' : 'Обсудить сайт'}
        </button>
        {submitError ? <SubmitError message={submitError} /> : null}
      </form>
    )
  }

  if (variant === 'contact') {
    const fieldClass =
      'w-full h-12 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-foreground placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none transition-colors'
    const labelClass = 'mb-2 block text-xs font-medium tracking-[0.12em] uppercase text-white/45'
    const submitButtonClass = `mt-7 ${GOLD_SUBMIT_BUTTON_CLASS}`

    return (
      <form onSubmit={onFormSubmit} className={`relative flex w-full flex-col gap-4 ${className}`}>
        <HoneypotField value={website} onChange={updateWebsite} />
        <div>
          <label className={labelClass}>Имя</label>
          <input
            type="text"
            placeholder="Как к вам обращаться"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Телефон или Telegram</label>
          <input
            type="text"
            placeholder="@username или номер"
            value={formData.contact}
            onChange={(e) => updateField('contact', e.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>О задаче</label>
          <textarea
            placeholder="Коротко: что нужно и к какому сроку"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
            rows={2}
            className={`${fieldClass} min-h-[88px] h-auto py-3 resize-none leading-relaxed`}
          />
        </div>
        <div className="pt-1">
          <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
          {submitError ? <SubmitError message={submitError} /> : null}
        </div>
        <p className="text-center text-xs text-white/45">
          Без спама — только ответ по вашей задаче
        </p>
      </form>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={onFormSubmit} className={`relative space-y-4 ${className}`}>
        <HoneypotField value={website} onChange={updateWebsite} />
        <p className="text-sm text-muted-foreground">
          Расскажите коротко о задаче — ответим в течение дня и подскажем, с чего начать.
        </p>
        <input
          type="text"
          placeholder="Имя"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <input
          type="text"
          placeholder="Телефон или Telegram"
          value={formData.contact}
          onChange={(e) => updateField('contact', e.target.value)}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <textarea
          placeholder="Коротко о задаче"
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          rows={3}
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors resize-none"
        />
        <button type="submit" disabled={isSubmitting} className={GOLD_SUBMIT_BUTTON_CLASS}>
          {isSubmitting ? 'Отправка...' : 'Обсудить сайт'}
        </button>
        {submitError ? <SubmitError message={submitError} /> : null}
        <p className="text-xs text-muted-foreground text-center">
          Ответим в течение дня
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Без спама. Только ответ по вашей задаче.
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={onFormSubmit} className={`relative space-y-5 ${className}`}>
      <HoneypotField value={website} onChange={updateWebsite} />
      <p className="text-muted-foreground">
        Расскажите коротко о задаче — ответим в течение дня и подскажем, с чего начать.
      </p>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Имя</label>
        <input
          type="text"
          placeholder="Имя"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Телефон или Telegram</label>
        <input
          type="text"
          placeholder="Телефон или Telegram"
          value={formData.contact}
          onChange={(e) => updateField('contact', e.target.value)}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Коротко о задаче</label>
        <textarea
          placeholder="Коротко о задаче"
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          rows={3}
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors resize-none"
        />
      </div>
      <button type="submit" disabled={isSubmitting} className={GOLD_SUBMIT_BUTTON_CLASS}>
        {isSubmitting ? 'Отправка...' : 'Обсудить сайт'}
      </button>
      {submitError ? <SubmitError message={submitError} /> : null}
      <p className="text-xs text-muted-foreground text-center">
        Ответим в течение дня
      </p>
      <p className="text-xs text-muted-foreground text-center pt-2">
        Без спама. Только ответ по вашей задаче.
      </p>
    </form>
  )
}
