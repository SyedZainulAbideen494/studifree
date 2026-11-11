import React, { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Layers } from 'lucide-react'

const cinematicEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Join conditional class names without pulling in another dependency. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Pointer-driven magnetism and a cursor-following highlight for primary
 * actions. Only fine-pointer devices receive the effect, and all writes happen
 * inside one animation frame so React does not render on pointer movement.
 */
function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let nextX = 0
    let nextY = 0

    const paint = () => {
      frame = 0
      element.style.transform =
        nextX === 0 && nextY === 0
          ? ''
          : `translate3d(${nextX.toFixed(2)}px, ${nextY.toFixed(2)}px, 0)`
    }

    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      nextX = (x - 0.5) * 7
      nextY = (y - 0.5) * 5
      element.style.setProperty('--sf-pointer-x', `${x * 100}%`)
      element.style.setProperty('--sf-pointer-y', `${y * 100}%`)
      queue()
    }

    const onLeave = () => {
      nextX = 0
      nextY = 0
      element.style.removeProperty('--sf-pointer-x')
      element.style.removeProperty('--sf-pointer-y')
      queue()
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
      if (frame) window.cancelAnimationFrame(frame)
      element.style.transform = ''
    }
  }, [])

  return ref
}

export interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  x?: number
  once?: boolean
  style?: React.CSSProperties
}

/** Restrained cinematic reveal that fully respects reduced motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  once = true,
  style,
}: RevealProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y, x, scale: 0.986, filter: 'blur(10px)' }}
      whileInView={
        reduced ? undefined : { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }
      }
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 1.05, delay, ease: cinematicEase }}
    >
      {children}
    </motion.div>
  )
}

export interface TiltPanelProps {
  children: ReactNode
  className?: string
  intensity?: number
}

/**
 * Subtle three-dimensional tilt for selected glass surfaces. Disabled for
 * touch devices and reduced-motion visitors, where the panel stays flat.
 */
export function TiltPanel({ children, className, intensity = 4 }: TiltPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let rotateX = 0
    let rotateY = 0

    const paint = () => {
      frame = 0
      element.style.transform = `perspective(1500px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    }

    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      rotateY = x * intensity * 2
      rotateX = y * -intensity * 2
      element.style.setProperty('--sf-glint-x', `${(x + 0.5) * 100}%`)
      element.style.setProperty('--sf-glint-y', `${(y + 0.5) * 100}%`)
      element.classList.add('is-tilting')
      queue()
    }

    const onLeave = () => {
      rotateX = 0
      rotateY = 0
      element.classList.remove('is-tilting')
      element.style.removeProperty('--sf-glint-x')
      element.style.removeProperty('--sf-glint-y')
      queue()
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
      if (frame) window.cancelAnimationFrame(frame)
      element.style.transform = ''
    }
  }, [intensity])

  return (
    <div ref={ref} className={cx('sf-tilt', className)}>
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface LandingLinkProps {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  showArrow?: boolean
  onClick?: () => void
  ariaLabel?: string
}

/** One link primitive for anchors, internal routes and external resources. */
export function LandingLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  showArrow = false,
  onClick,
  ariaLabel,
}: LandingLinkProps) {
  const magneticRef = useMagnetic<HTMLAnchorElement>()
  const classes = cx('sf-btn', `sf-btn--${variant}`, size !== 'md' && `sf-btn--${size}`, className)
  const content = (
    <>
      <span className="sf-btn__label">{children}</span>
      {showArrow && (
        <span className="sf-btn__arrow" aria-hidden="true">
          <ArrowRight width={15} height={15} />
        </span>
      )}
    </>
  )

  const isExternal = /^https?:\/\//i.test(href)
  const isHash = href.startsWith('#')
  const isInternalRoute = href.startsWith('/') && !href.startsWith('//')

  if (isExternal) {
    return (
      <a
        ref={magneticRef}
        className={classes}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    )
  }

  if (isInternalRoute) {
    return (
      <Link ref={magneticRef} className={classes} to={href} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return (
    <a
      ref={magneticRef}
      className={classes}
      href={isHash ? href : `#${href}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </a>
  )
}

export interface TextLinkProps {
  href: string
  children: ReactNode
  className?: string
  showArrow?: boolean
}

export function TextLink({ href, children, className, showArrow = true }: TextLinkProps) {
  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight width={14} height={14} aria-hidden="true" />}
    </>
  )
  const classes = cx('sf-text-link', className)

  if (/^https?:\/\//i.test(href)) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    )
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link className={classes} to={href}>
        {content}
      </Link>
    )
  }

  return <a className={classes} href={href.startsWith('#') ? href : `#${href}`}>{content}</a>
}

export interface LandingBrandProps {
  to?: string
}

export function LandingBrand({ to = '/' }: LandingBrandProps) {
  return (
    <Link className="sf-brand" to={to} aria-label="Studifree home">
      <span className="sf-brand__mark" aria-hidden="true">
        <Layers strokeWidth={1.7} />
      </span>
      <span className="sf-brand__text">Studifree</span>
    </Link>
  )
}

export interface SectionHeadProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  center?: boolean
  className?: string
  id?: string
  meta?: string
}

export function SectionHead({
  eyebrow,
  title,
  description,
  center = false,
  className,
  id,
  meta,
}: SectionHeadProps) {
  const reduced = useReducedMotion() === true

  const group = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.95, ease: cinematicEase },
    },
  }

  const rule = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 1.15, ease: cinematicEase },
    },
  }

  return (
    <motion.div
      className={cx('sf-section-head', center && 'sf-section-head--center', className)}
      variants={group}
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-85px' }}
    >
      {(eyebrow || meta) && (
        <motion.div className="sf-section-head__meta" variants={item}>
          {eyebrow && <p className="sf-label">{eyebrow}</p>}
          {meta && <span className="sf-section-head__index">{meta}</span>}
        </motion.div>
      )}
      <motion.h2 className="sf-h2" id={id} variants={item}>
        {title}
      </motion.h2>
      <motion.span className="sf-section-head__rule" variants={rule} aria-hidden="true" />
      {description && (
        <motion.p className="sf-lead" variants={item}>
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}

/**
 * Word-by-word focus reveal driven by scroll progress. Each word fades from
 * muted to white as the section passes the viewport. The text remains fully
 * readable when motion is reduced.
 */
function FocusWord({
  word,
  progress,
  range,
  reduced,
}: {
  word: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  range: [number, number]
  reduced: boolean
}) {
  const opacity = useTransform(progress, range, [0.16, 1])

  return (
    <motion.span className="sf-focus-word" style={reduced ? undefined : { opacity }}>
      {word}{' '}
    </motion.span>
  )
}

export function ScrollFocusText({
  text,
  className,
  id,
}: {
  text: string
  className?: string
  id?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion() === true
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'end 0.35'],
  })
  const words = text.split(' ')

  return (
    <p ref={ref} className={cx('sf-focus-text', className)} id={id}>
      {words.map((word, index) => {
        const start = index / Math.max(words.length, 1)
        const end = Math.min(1, start + 0.34)
        return (
          <FocusWord
            key={`${word}-${index}`}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
            reduced={reduced}
          />
        )
      })}
    </p>
  )
}
