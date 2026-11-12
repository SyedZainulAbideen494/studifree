import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { landingFaqItems, type LandingFaqItem } from '../../data/landing'
import { SectionHead } from './shared'

/**
 * Experimental FAQ: questions float as glass fragments. Selecting one blurs
 * the field and opens a focused reading panel with full keyboard support.
 */
export function LandingFAQ() {
  const [selected, setSelected] = useState<LandingFaqItem | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion() === true

  const openAnswer = (item: LandingFaqItem, trigger: HTMLElement) => {
    lastFocused.current = trigger
    setSelected(item)
  }

  useEffect(() => {
    if (!selected) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSelected(null)
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      lastFocused.current?.focus()
    }
  }, [selected])

  return (
    <section className="sf-faq sf-section" id="faq" aria-labelledby="faq-title">
      <div className="sf-container">
        <SectionHead
          eyebrow="16 / Questions"
          id="faq-title"
          title="Everything else, up close."
          description="Tap a question. The rest of the page will wait."
        />

        <div className={`sf-faq__field${selected ? ' is-dimmed' : ''}`}>
          {landingFaqItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="sf-faq__chip"
              onClick={(event) => openAnswer(item, event.currentTarget)}
              aria-haspopup="dialog"
            >
              <span className="sf-faq__chip-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="sf-faq__chip-question">{item.question}</span>
              <ArrowUpRight width={13} height={13} aria-hidden="true" />
            </button>
          ))}
        </div>

        <p className="sf-faq__hint">
          <span aria-hidden="true">●</span> Nine answers. No fine print hidden in a manual.
        </p>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="sf-faq__overlay"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null)
            }}
          >
            <motion.div
              className="sf-glass sf-faq__panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="faq-panel-title"
              initial={reduced ? false : { opacity: 0, y: 26, scale: 0.97, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reduced ? undefined : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              <div className="sf-faq__panel-head">
                <span>STUDIFREE / ANSWER</span>
                <button
                  type="button"
                  ref={closeRef}
                  className="sf-faq__close"
                  onClick={() => setSelected(null)}
                  aria-label="Close answer"
                >
                  <X width={17} height={17} />
                </button>
              </div>
              <div className="sf-faq__panel-body">
                <p className="sf-faq__panel-index">
                  {String(landingFaqItems.findIndex((item) => item.id === selected.id) + 1).padStart(
                    2,
                    '0',
                  )}{' '}
                  / {String(landingFaqItems.length).padStart(2, '0')}
                </p>
                <h3 id="faq-panel-title">{selected.question}</h3>
                <p className="sf-faq__answer">{selected.answer}</p>
              </div>
              <div className="sf-faq__panel-foot">
                <span>Still curious?</span>
                <Link to="/help">
                  Visit the Help Centre <ArrowUpRight width={12} height={12} aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
