'use client'

import { useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

const projects = [
  {
    id: 1,
    title: 'FinanceHub',
    category: 'Финтех',
    year: '2024',
    description: 'Редизайн платформы для управления инвестициями',
    color: '#d4af37',
  },
  {
    id: 2,
    title: 'TechVision',
    category: 'SaaS',
    year: '2024',
    description: 'Корпоративный сайт IT-компании',
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: 'StyleStore',
    category: 'E-commerce',
    year: '2023',
    description: 'Интернет-магазин премиальной одежды',
    color: '#d4af37',
  },
  {
    id: 4,
    title: 'MedClinic',
    category: 'Медицина',
    year: '2023',
    description: 'Лендинг для частной клиники',
    color: '#8b5cf6',
  },
]

export default function Portfolio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section 
      id="work" 
      className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden"
      ref={ref}
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <div 
          className={`flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20 md:mb-32 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div>
            <p className="text-sm tracking-[0.4em] uppercase text-gold mb-6">
              Портфолио
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em]">
              <span className="text-foreground">Избранные</span>
              <br />
              <span className="text-gradient-gold">работы</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-md font-light">
            Каждый проект — это история. Посмотрите, как мы помогли нашим клиентам достичь целей.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`group relative aspect-[4/3] overflow-hidden cursor-pointer transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Background */}
              <div 
                className="absolute inset-0 transition-all duration-700"
                style={{
                  background: `linear-gradient(135deg, ${project.color}15 0%, transparent 60%)`,
                  transform: hoveredId === project.id ? 'scale(1.05)' : 'scale(1)',
                }}
              />

              {/* Border */}
              <div 
                className="absolute inset-0 border transition-colors duration-500"
                style={{
                  borderColor: hoveredId === project.id ? project.color : 'rgba(255,255,255,0.1)',
                }}
              />

              {/* Content */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                {/* Top */}
                <div className="flex justify-between items-start">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    {project.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {project.year}
                  </span>
                </div>

                {/* Bottom */}
                <div>
                  <h3 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300"
                    style={{
                      color: hoveredId === project.id ? project.color : '#ffffff',
                    }}
                  >
                    {project.title}
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm md:text-base transition-all duration-500"
                    style={{
                      opacity: hoveredId === project.id ? 1 : 0,
                      transform: hoveredId === project.id ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    {project.description}
                  </p>
                </div>

                {/* View icon */}
                <div 
                  className="absolute bottom-8 right-8 md:bottom-12 md:right-12 w-12 h-12 border flex items-center justify-center transition-all duration-500"
                  style={{
                    borderColor: hoveredId === project.id ? project.color : 'rgba(255,255,255,0.2)',
                    transform: hoveredId === project.id ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <svg 
                    className="w-5 h-5 transition-colors duration-300"
                    style={{ color: hoveredId === project.id ? project.color : '#ffffff' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </div>

              {/* Project number */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] md:text-[15vw] font-bold pointer-events-none select-none transition-opacity duration-500"
                style={{
                  WebkitTextStroke: `1px ${project.color}20`,
                  color: 'transparent',
                  opacity: hoveredId === project.id ? 0.3 : 0.1,
                }}
              >
                0{project.id}
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div 
          className={`mt-16 text-center transition-all duration-1000 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-4 text-lg text-muted-foreground hover:text-gold transition-colors duration-300"
          >
            <span>Обсудить ваш проект</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
