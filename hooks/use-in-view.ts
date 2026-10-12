import { useEffect, useState, useRef } from 'react'

interface UseInViewOptions {
  threshold?: number | number[]
  margin?: string
  once?: boolean
}

export function useInView(ref: React.RefObject<HTMLElement | null>, options: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const hasBeenInView = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          hasBeenInView.current = true
          if (options.once) {
            observer.unobserve(entry.target)
          }
        } else if (!options.once) {
          setIsInView(false)
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.margin ?? '0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isInView || (options.once && hasBeenInView.current)
}
