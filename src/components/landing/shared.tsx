import React, { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Layers } from 'lucide-react'

/** Join conditional class names without pulling in another dependency. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Pointer-driven magnetism for primary actions. The native cursor is never
 * replaced and only fine-pointer devices receive the effect. Motion is written
 * straight to the element inside one animation frame so React does not render
 * on every pointer event.
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
      const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)
      nextX = dx * 4.5
      nextY = dy * 3.5
      element.style.setProperty('--sf-pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
      element.style.setProperty('--sf-pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
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

/**
 * Small cinematic reveal. Every instance checks the visitor's motion
 * preference, so only the transform duration changes, never the content.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
  once = true,
  style,
}: RevealProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y, x }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.78, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export interface TiltPanelProps {
  children: ReactNode
  className?: string
  /** Maximum rotation in degrees. Keep this restrained. */
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
      element.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
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

/**
 * One link primitive for anchors, internal routes and external resources.
 * Internal routes use the router so navigation stays instant.
 */
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
  const classes = cx(
    'sf-btn',
    `sf-btn--${variant}`,
    size !== 'md' && `sf-btn--${size}`,
    className,
  )
  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight className="sf-btn__arrow" width={16} height={16} aria-hidden="true" />}
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

  return (
    <a className={classes} href={href.startsWith('#') ? href : `#${href}`}>
      {content}
    </a>
  )
}

export interface LandingBrandProps {
  to?: string
}

export function LandingBrand({ to = '/' }: LandingBrandProps) {
  return (
    <Link className="sf-brand" to={to} aria-label="Studifree home">
      <span className="sf-brand__mark" aria-hidden="true">
        <Layers strokeWidth={1.8} />
      </span>
      <span>Studifree</span>
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
  return (
    <div
      className={cx('sf-section-head', center && 'sf-section-head--center', className)}
    >
      {(eyebrow || meta) && (
        <div className="sf-section-head__meta">
          {eyebrow && <p className="sf-eyebrow">{eyebrow}</p>}
          {meta && <span className="sf-section-head__index">{meta}</span>}
        </div>
      )}
      <h2 className="sf-h2" id={id}>
        {title}
      </h2>
      {description && <p className="sf-lead">{description}</p>}
    </div>
  )
}
