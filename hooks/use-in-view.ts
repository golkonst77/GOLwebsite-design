import { useEffect, useState, useRef } from 'react'

interface UseInViewOptions {
  threshold?: number | number[]
  margin?: string
  once?: boolean
}

export function useInView(ref: React.RefObject<HTMLElement | null>, options: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const hasBeenInView = useRef(false)
  const { threshold = 0.1, margin = '0px', once = false } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          hasBeenInView.current = true
          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      {
        threshold: threshold,
        rootMargin: margin,
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold, margin, once])

  return isInView || (once && hasBeenInView.current)
}
