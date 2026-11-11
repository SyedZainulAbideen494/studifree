import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { landingNavItems } from '../../data/landing'
import { LandingBrand, LandingLink, cx } from './shared'

/**
 * Floating glass navigation. It shrinks and gains blur after the hero begins,
 * and the mobile version expands as an iOS-style sheet instead of a full-width
 * traditional menu bar.
 */
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const reduced = useReducedMotion() === true
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 32)
      let current: string | null = null
      for (const item of landingNavItems) {
        const id = item.href.replace('#', '')
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= window.innerHeight * 0.42) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 920) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <div className="sf-nav-wrap">
      <motion.nav
        className={cx('sf-nav', scrolled && 'sf-nav--scrolled', open && 'sf-nav--open')}
        aria-label="Studifree landing page"
        initial={reduced ? false : { y: -26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <LandingBrand />

        <span className="sf-nav__divider" aria-hidden="true" />

        <div className="sf-nav__links">
          {landingNavItems.map((item) => {
            const id = item.href.replace('#', '')
            return (
              <a
                key={item.href}
                className={cx('sf-nav__link', active === id && 'is-active')}
                href={item.href}
                aria-current={active === id ? 'true' : undefined}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <LandingLink href="/home" className="sf-nav__cta" size="sm" variant="primary">
          Open Studifree <span aria-hidden="true">→</span>
        </LandingLink>

        <button
          type="button"
          className="sf-nav__menu"
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X width={17} height={17} /> : <Menu width={17} height={17} />}
        </button>

        <motion.span
          className="sf-nav__progress"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="sf-glass sf-nav__mobile"
            id="landing-mobile-menu"
            initial={reduced ? false : { opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sf-nav__mobile-head">
              <span>Navigate</span>
              <span>SF / 2026</span>
            </div>
            {landingNavItems.map((item, index) => (
              <motion.a
                key={item.href}
                className="sf-nav__mobile-link"
                href={item.href}
                onClick={() => setOpen(false)}
                initial={reduced ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduced ? 0 : 0.05 + index * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="sf-nav__mobile-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
                <ArrowUpRight width={14} height={14} aria-hidden="true" />
              </motion.a>
            ))}
            <div className="sf-nav__mobile-actions">
              <LandingLink href="/home" variant="primary" showArrow onClick={() => setOpen(false)}>
                Open Studifree
              </LandingLink>
            </div>
            <p className="sf-nav__mobile-note">Local-first · Optional AI · No mandatory account</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
