'use client'

import { useState } from 'react'

interface LeadFormProps {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

export default function LeadForm({ variant = 'default', className = '' }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className={`p-8 border border-neon-green/30 bg-neon-green/5 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">Заявка отправлена</h3>
        <p className="text-muted-foreground">Мы свяжемся с вами в течение 2 часов</p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-4 ${className}`}>
        <input
          type="text"
          placeholder="Ваш Telegram или телефон"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          required
          className="flex-1 px-6 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-4 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-wider uppercase text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Отправка...' : 'Получить консультацию'}
        </button>
      </form>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        <input
          type="text"
          placeholder="Имя"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <input
          type="text"
          placeholder="Telegram или телефон"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-4 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-wider uppercase text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Отправка...' : 'Получить консультацию'}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Ответим в течение 2 часов. Без спама.
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Ваше имя</label>
        <input
          type="text"
          placeholder="Как к вам обращаться?"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Telegram или телефон</label>
        <input
          type="text"
          placeholder="@username или +7..."
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          required
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">О проекте (опционально)</label>
        <textarea
          placeholder="Расскажите кратко о вашем проекте..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={3}
          className="w-full px-5 py-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:outline-none transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-8 py-5 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-wider uppercase disabled:opacity-50"
      >
        {isSubmitting ? 'Отправка...' : 'Получить бесплатную консультацию'}
      </button>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Ответ за 2 часа
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Без предоплаты
        </span>
      </div>
    </form>
  )
}
