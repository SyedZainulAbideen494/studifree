import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { landingNavItems } from '../../data/landing'
import { LandingBrand, LandingLink, cx } from './shared'

/**
 * Floating navigation that becomes a glass surface once the page moves.
 * The mobile panel is a normal, keyboard-reachable list; nothing is hidden
 * behind hover-only behaviour.
 */
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 12)

      let current: string | null = null
      for (const item of landingNavItems) {
        const id = item.href.replace('#', '')
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= 180) current = id
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
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <div className="sf-nav-wrap">
      <nav
        className={cx('sf-nav', scrolled && 'sf-nav--scrolled', open && 'sf-nav--open')}
        aria-label="Studifree landing page"
      >
        <LandingBrand />

        <div className="sf-nav__links">
          {landingNavItems.map((item) => {
            const id = item.href.replace('#', '')
            return (
              <a
                key={item.href}
                className="sf-nav__link"
                href={item.href}
                aria-current={active === id ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <div className="sf-nav__actions">
          <LandingLink href="/" variant="secondary" size="sm">
            Open app
          </LandingLink>
          <LandingLink href="/" variant="primary" size="sm" showArrow>
            Start learning
          </LandingLink>
        </div>

        <button
          type="button"
          className="sf-nav__menu"
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X width={18} height={18} /> : <Menu width={18} height={18} />}
        </button>
      </nav>

      {open && (
        <div className="sf-glass sf-nav__mobile" id="landing-mobile-menu">
          {landingNavItems.map((item) => (
            <a
              key={item.href}
              className="sf-nav__mobile-link"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="sf-nav__mobile-actions">
            <LandingLink href="/" variant="secondary" onClick={() => setOpen(false)}>
              Open app
            </LandingLink>
            <LandingLink href="/" variant="primary" showArrow onClick={() => setOpen(false)}>
              Start learning
            </LandingLink>
          </div>
        </div>
      )}
    </div>
  )
}
