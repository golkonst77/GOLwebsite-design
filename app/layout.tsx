import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ConsentAnalytics } from '@/components/consent/consent-analytics'
import { ConsentShell } from '@/components/consent/consent-shell'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: 'GØL — Студия веб-дизайна',
  description: 'Премиум-студия веб-дизайна. Чистый дизайн, сильный результат. Посадочные страницы, сайты, редизайн и поддержка.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="dark bg-background">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ConsentShell>{children}{process.env.NODE_ENV === 'production' && <ConsentAnalytics />}</ConsentShell>
      </body>
    </html>
  )
}
