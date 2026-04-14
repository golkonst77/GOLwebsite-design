'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'
import LeadForm from './lead-form'

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="contact" className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-green/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-neon-blue/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Content */}
            <div>
              <p className="text-neon-green text-sm tracking-[0.3em] uppercase mb-4">
                Начнём?
              </p>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Получите сайт, который
                <span className="text-neon-green"> работает на вас</span>
              </h2>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Оставьте заявку — обсудим ваш проект, дадим рекомендации и назовём точную стоимость. 
                Консультация бесплатная и ни к чему не обязывает.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-foreground">Ответим за 2 часа</span>
                    <p className="text-sm text-muted-foreground">Не заставляем ждать</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-foreground">Без предоплаты за консультацию</span>
                    <p className="text-sm text-muted-foreground">Платите только за работу</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-foreground">Честная оценка проекта</span>
                    <p className="text-sm text-muted-foreground">Скажем, если это не наш формат</p>
                  </div>
                </div>
              </div>

              {/* Alternative contact */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Или напишите напрямую:
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://t.me/gol_studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-neon-green hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.013.103.03.336.017.519z"/>
                    </svg>
                    <span className="text-sm font-medium">@gol_studio</span>
                  </a>
                  <a
                    href="mailto:hello@gol.studio"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">hello@gol.studio</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="p-8 border border-neon-green/30 bg-card/50">
              <h3 className="text-xl font-bold mb-2">
                Оставить заявку
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Заполните форму — свяжемся в течение 2 часов
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
