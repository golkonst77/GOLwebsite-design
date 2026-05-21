import type { ReactNode } from 'react'
import Link from 'next/link'

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index))
    }
    const href = match[2]
    const isExternal = href.startsWith('http')
    nodes.push(
      isExternal ? (
        <a
          key={`${match.index}-link`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold/90 hover:text-gold underline underline-offset-2"
        >
          {match[1]}
        </a>
      ) : (
        <Link
          key={`${match.index}-link`}
          href={href}
          className="text-gold/90 hover:text-gold underline underline-offset-2"
        >
          {match[1]}
        </Link>
      ),
    )
    last = match.index + match[0].length
  }

  if (last < text.length) {
    nodes.push(text.slice(last))
  }

  return nodes.length ? nodes : [text]
}

export function renderSimpleMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '' || line.trim() === '---') {
      i += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={key++} className="mt-8 mb-3 text-lg font-semibold text-foreground">
          {renderInline(line.slice(4))}
        </h3>,
      )
      i += 1
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="mt-10 mb-4 text-xl font-bold text-foreground tracking-tight">
          {renderInline(line.slice(3))}
        </h2>,
      )
      i += 1
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={key++} className="mb-6 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {renderInline(line.slice(2))}
        </h1>,
      )
      i += 1
      continue
    }

    if (line.startsWith('- ')) {
      const items: ReactNode[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(
          <li key={key++} className="text-white/65 leading-relaxed">
            {renderInline(lines[i].slice(2))}
          </li>,
        )
        i += 1
      }
      blocks.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-5">
          {items}
        </ul>,
      )
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('- ')) {
      para.push(lines[i])
      i += 1
    }
    blocks.push(
      <p key={key++} className="my-3 text-white/65 leading-relaxed">
        {renderInline(para.join(' '))}
      </p>,
    )
  }

  return blocks
}
