'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import Hero from '@/components/hero'
import Problem from '@/components/problem'
import Solution from '@/components/solution'
import Services from '@/components/services'
import Process from '@/components/process'
import Cases from '@/components/cases'
import Testimonials from '@/components/testimonials'
import Trust from '@/components/trust'
import FinalCTA from '@/components/final-cta'
import Footer from '@/components/footer'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="bg-background text-foreground overflow-hidden">
      <Header isScrolled={isScrolled} />
      <Hero />
      <Problem />
      <Solution />
      <Services />
      <Process />
      <Cases />
      <Testimonials />
      <Trust />
      <FinalCTA />
      <Footer />
    </main>
  )
}
