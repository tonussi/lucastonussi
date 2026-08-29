import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades its children up once they scroll into view. Falls back to visible when
 * IntersectionObserver is unavailable, so nothing is ever stuck at opacity 0.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out motion-reduce:transition-none',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Full-height landing section with a centered content column. */
export function Section({
  id,
  children,
  className,
  contentClassName,
}: {
  id?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative flex min-h-screen scroll-mt-24 items-center overflow-hidden px-4 py-24 sm:py-32',
        className,
      )}
    >
      <div className={cn('mx-auto w-full max-w-6xl', contentClassName)}>{children}</div>
    </section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
      {children}
    </span>
  )
}

/** A phone-shaped frame around one app screenshot. */
export function PhoneMockup({
  src,
  alt,
  className,
  eager = false,
  glow = 'from-blue-500/25 via-emerald-400/15',
}: {
  src: string
  alt: string
  className?: string
  eager?: boolean
  glow?: string
}) {
  return (
    <div className={cn('relative mx-auto w-[240px] sm:w-[280px]', className)}>
      <div
        aria-hidden
        className={cn(
          'absolute -inset-8 rounded-[4rem] bg-gradient-to-tr to-transparent blur-3xl',
          glow,
        )}
      />
      <div className="relative rounded-[2.5rem] border border-gray-800/60 bg-gray-900 p-2 shadow-2xl shadow-black/40 dark:border-gray-700">
        <div
          aria-hidden
          className="absolute left-1/2 top-3.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-gray-700/80"
        />
        <img
          src={src}
          alt={alt}
          width={700}
          height={1500}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full rounded-[2rem] bg-white"
        />
      </div>
    </div>
  )
}

/** Text column + phone column, alternating sides on large screens. */
export function ShowcaseRow({
  reverse = false,
  media,
  children,
}: {
  reverse?: boolean
  media: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn(reverse && 'lg:order-2')}>{children}</Reveal>
      <Reveal delay={120} className={cn(reverse && 'lg:order-1')}>
        {media}
      </Reveal>
    </div>
  )
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-muted-foreground">
          <span
            aria-hidden
            className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
