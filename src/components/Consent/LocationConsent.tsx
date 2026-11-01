import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MapPin, ShieldCheck, X, Loader2 } from 'lucide-react'
import { Button } from '../UI/Button'
import {
  getLocationConsent,
  sendLocationEmail,
  setLocationConsent,
  isTrackingAllowed,
  LOCATION_CONSENT_RESET_EVENT,
} from '../../services/visitorTracking'

const PROMPT_DELAY_MS = 1400

/**
 * Optional, consent-first location sharing.
 *
 * Nothing is requested from the browser until the visitor presses
 * "Allow location". Declining is remembered and the website continues
 * exactly as before.
 */
export const LocationConsentGate: React.FC = () => {
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const allowRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const prompted = useRef(false)

  useEffect(() => {
    if (prompted.current) return
    prompted.current = true
    if (typeof window === 'undefined') return
    if (!isTrackingAllowed(window.location.hostname, window.location.pathname)) return
    if (!('geolocation' in navigator)) return
    if (getLocationConsent() !== null) return

    const timer = window.setTimeout(() => setOpen(true), PROMPT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onReset = () => {
      if (getLocationConsent() === null) setOpen(true)
    }
    window.addEventListener(LOCATION_CONSENT_RESET_EVENT, onReset)
    return () => window.removeEventListener(LOCATION_CONSENT_RESET_EVENT, onReset)
  }, [])

  function decline() {
    if (busy) return
    setLocationConsent('declined')
    setOpen(false)
    setBusy(false)
    setError(null)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') decline()
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => allowRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, busy])

  const allow = () => {
    if (busy) return
    setError(null)
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationConsent('granted')
        setBusy(false)
        setOpen(false)
        // Send in the background; the app never waits on EmailJS.
        void sendLocationEmail({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (geoError) => {
        setBusy(false)
        setLocationConsent('declined')
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setOpen(false)
          return
        }
        setError('Location is unavailable right now. You can continue without sharing.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => !busy && decline()}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-consent-title"
            aria-describedby="location-consent-description"
            initial={reducedMotion ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md rounded-3xl glass border border-line-strong shadow-float p-6 sm:p-7"
          >
            <button
              onClick={() => !busy && decline()}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-muted hover:bg-accent-soft hover:text-ink transition"
              aria-label="Close and continue without sharing location"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-line flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-ink" />
            </div>

            <h2 id="location-consent-title" className="text-xl font-semibold text-ink tracking-tight">
              Share your location?
            </h2>
            <p id="location-consent-description" className="text-sm text-muted mt-2 leading-relaxed">
              This is completely optional. Studifree can include your approximate location in a visitor
              notification so the site owner knows where learners are joining from.
            </p>

            <div className="mt-4 rounded-2xl bg-inset border border-line p-3.5 space-y-2 text-xs text-muted leading-relaxed">
              <p>
                <span className="text-ink font-medium">What is shared:</span> latitude, longitude, accuracy in
                metres, visit time and page URL, together with your IP address and browser details.
              </p>
              <p>
                <span className="text-ink font-medium">What is not:</span> nothing is stored in your study data,
                and no location is collected unless you press Allow.
              </p>
            </div>

            {error && <p className="text-xs text-ink mt-3">{error}</p>}

            <div className="mt-5 space-y-2">
              <Button ref={allowRef} onClick={allow} disabled={busy} className="w-full">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {busy ? 'Requesting location…' : 'Allow location'}
              </Button>
              <Button variant="secondary" onClick={decline} disabled={busy} className="w-full">
                Continue without sharing
              </Button>
            </div>

            <div className="flex items-start gap-2 mt-4 text-[11px] text-faint leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                You can change this choice at any time in Settings → Privacy. Declining never limits access to
                Studifree.
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
