import React, { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Layers } from 'lucide-react'

/** Join conditional class names without pulling in another dependency. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  style?: React.CSSProperties
}

/**
 * Small cinematic reveal. Every instance checks the visitor's motion
 * preference, so only the transform duration changes, never the content.
 */
export function Reveal({ children, className, delay = 0, y = 24, once = true, style }: RevealProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
      <Link className={classes} to={href} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return (
    <a
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

export function LandingBrand({ to = '/landing' }: LandingBrandProps) {
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
}

export function SectionHead({ eyebrow, title, description, center = false, className, id }: SectionHeadProps) {
  return (
    <div
      className={cx('sf-section-head', center && 'sf-section-head--center', className)}
    >
      {eyebrow && <p className="sf-eyebrow">{eyebrow}</p>}
      <h2 className="sf-h2" id={id}>
        {title}
      </h2>
      {description && <p className="sf-lead">{description}</p>}
    </div>
  )
}
