import type { Metadata } from 'next'
import LexRadarPage from '@/components/lexradar-page'

const title = 'LexRadar — проверка сайта и юридические документы | GØL'
const description = 'Бесплатная предварительная проверка публичной части сайта. Индивидуальные юридические документы и подробная методичка для вашего вебмастера.'
const url = 'https://golwebstudio.ru/lexradar'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, locale: 'ru_RU', type: 'website' },
}

export default function Page() {
  return <LexRadarPage />
}
