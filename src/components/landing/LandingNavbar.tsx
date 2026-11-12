import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CircleQuestionMark,
  Compass,
  House,
  ListChecks,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { landingNavItems, type LandingNavItem } from '../../data/landing'
import { cx } from './shared'

const icons: Record<LandingNavItem['id'], LucideIcon> = {
  home: House,
  features: Sparkles,
  'how-it-works': ListChecks,
  about: Compass,
  faq: CircleQuestionMark,
}

/** Accent tints are stored as RGB triples so they can be used at any alpha. */
const accents: Record<LandingNavItem['accent'], string> = {
  blue: '79, 140, 255',
  violet: '160, 124, 255',
  orange: '255, 122, 69',
  red: '255, 77, 94',
}

const dockSpring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.85 } as const
const dockEase = [0.16, 1, 0.3, 1] as const

type ActiveId = LandingNavItem['id']

/**
 * Floating icon dock. Five familiar icons live inside one glass capsule; the
 * active section is marked by a single pill that physically springs between
 * icons through a shared layout id. Scroll position drives the active icon,
 * with a short lock after a click so the indicator travels straight to the
 * chosen section instead of hopping through everything in between.
 */
export function LandingNavbar() {
  const [active, setActive] = useState<ActiveId>('home')
  const [scrolled, setScrolled] = useState(false)
  const [ripple, setRipple] = useState<{ id: ActiveId; nonce: number } | null>(null)
  const reduced = useReducedMotion() === true

  const lockRef = useRef<ActiveId | null>(null)
  const settleRef = useRef(0)
  const lockTimeoutRef = useRef(0)
  const rippleTimeoutRef = useRef(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      setScrolled(window.scrollY > 28)
      if (lockRef.current) return

      const threshold = window.innerHeight * 0.4
      let current: ActiveId = 'home'
      for (const item of landingNavItems) {
        const section = document.getElementById(item.href.slice(1))
        if (!section) continue
        if (section.getBoundingClientRect().top <= threshold) current = item.id
      }
      setActive((previous) => (previous === current ? previous : current))
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    const onScroll = () => {
      if (lockRef.current) {
        window.clearTimeout(settleRef.current)
        settleRef.current = window.setTimeout(() => {
          lockRef.current = null
          schedule()
        }, 170)
      }
      schedule()
    }

    const onScrollEnd = () => {
      window.clearTimeout(settleRef.current)
      lockRef.current = null
      schedule()
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScrollEnd)
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(settleRef.current)
      window.clearTimeout(lockTimeoutRef.current)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(rippleTimeoutRef.current), [])

  const navigate = (item: LandingNavItem) => {
    setActive(item.id)
    lockRef.current = item.id
    window.clearTimeout(lockTimeoutRef.current)
    lockTimeoutRef.current = window.setTimeout(() => {
      lockRef.current = null
    }, 3000)

    setRipple({ id: item.id, nonce: Date.now() })
    window.clearTimeout(rippleTimeoutRef.current)
    rippleTimeoutRef.current = window.setTimeout(() => setRipple(null), 760)
  }

  const magnetize = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const anchor = event.currentTarget
    const capsule = anchor.querySelector<HTMLElement>('.sf-dock__mag')
    if (!capsule) return
    const rect = anchor.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    capsule.style.setProperty('--mag-x', `${(x * 4.5).toFixed(2)}px`)
    capsule.style.setProperty('--mag-y', `${(y * 3.5).toFixed(2)}px`)
  }

  const releaseMagnet = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    const capsule = event.currentTarget.querySelector<HTMLElement>('.sf-dock__mag')
    capsule?.style.removeProperty('--mag-x')
    capsule?.style.removeProperty('--mag-y')
  }

  return (
    <div className="sf-dock-wrap">
      <motion.nav
        className={cx('sf-dock', scrolled && 'is-scrolled')}
        aria-label="Landing page sections"
        initial={reduced ? false : { y: -24, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: scrolled ? 0.958 : 1 }}
        transition={{ duration: reduced ? 0 : 0.95, delay: reduced ? 0 : 0.2, ease: dockEase }}
      >
        <span className="sf-dock__sheen" aria-hidden="true" />

        <ul className="sf-dock__list">
          {landingNavItems.map((item) => {
            const Icon = icons[item.id]
            const isActive = active === item.id

            return (
              <li className="sf-dock__item" key={item.id}>
                <a
                  href={item.href}
                  className={cx('sf-dock__btn', isActive && 'is-active')}
                  aria-label={item.label}
                  aria-current={isActive ? 'location' : undefined}
                  style={{ '--dock-accent': accents[item.accent] } as React.CSSProperties}
                  onClick={() => navigate(item)}
                  onPointerMove={magnetize}
                  onPointerLeave={releaseMagnet}
                  onBlur={releaseMagnet}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sf-dock-indicator"
                      className="sf-dock__active"
                      transition={reduced ? { duration: 0 } : dockSpring}
                      aria-hidden="true"
                    />
                  )}

                  <span className="sf-dock__mag">
                    <span className="sf-dock__glyph">
                      <Icon width={20} height={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                  </span>

                  {ripple?.id === item.id && (
                    <span key={ripple.nonce} className="sf-dock__ripple" aria-hidden="true" />
                  )}

                  <span className="sf-dock__tip" aria-hidden="true">
                    <span className="sf-dock__tip-dot" />
                    {item.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </motion.nav>
    </div>
  )
}
