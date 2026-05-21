import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { renderSimpleMarkdown } from '@/lib/render-simple-markdown'

export const metadata = {
  title: 'Политика конфиденциальности — GØL Web Studio',
  description: 'Политика обработки персональных данных сайта golwebstudio.ru',
}

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'public', 'privacy.md')
  const policyText = fs.readFileSync(filePath, 'utf8')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-bold tracking-[0.15em] text-foreground transition-colors hover:text-gold"
          >
            <span>G</span>
            <span className="text-gold">Ø</span>
            <span>L</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-white/50 transition-colors hover:text-gold/90"
          >
            На главную
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          {renderSimpleMarkdown(policyText)}
        </div>
        <p className="mt-8 text-center text-xs text-white/40">
          Вопросы:{' '}
          <a
            href="mailto:golwebstudio@mail.ru"
            className="text-gold/80 hover:text-gold underline underline-offset-2"
          >
            golwebstudio@mail.ru
          </a>
        </p>
      </article>
    </main>
  )
}
