import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Props {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  labelledBy: string
  /** Waiting overlays cannot be dismissed. */
  dismissible?: boolean
  className?: string
}

export function GenerationModalShell({
  open,
  onClose,
  children,
  labelledBy,
  dismissible = true,
  className,
}: Props) {
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const fallbackId = useId()
  const titleId = labelledBy || fallbackId

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        '[data-autofocus], button, [href], input, select, textarea',
      )
      target?.focus()
    }, 60)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault()
        onClose?.()
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
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

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, dismissible, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="sf-gen-overlay"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22 }}
          onMouseDown={(event) => {
            if (dismissible && event.target === event.currentTarget) onClose?.()
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={['sf-gen-panel', className].filter(Boolean).join(' ')}
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.7 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
