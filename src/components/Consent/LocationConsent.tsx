import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Globe2, Loader2, MapPin, X } from 'lucide-react'
import { Button } from '../UI/Button'
import { notify } from '../../store/useAiEventsStore'
import {
  declineLocation,
  describeRegion,
  getAnalyticsLocationConsent,
  getBrowserLocationPermission,
  getCurrentCoordinates,
  getLocationPreference,
  grantLocation,
  resolveRegionalProfile,
  LOCATION_PREFERENCE_CHANGED_EVENT,
} from '../../services/location'
import { isTrackingAllowed, sendLocationEmail } from '../../services/visitorTracking'

const PROMPT_DELAY_MS = 1400

/**
 * Optional location consent. The prompt asks for permission without an
 * explanation; the browser itself is the source of the permission decision.
 * Declining is remembered and Studifree continues to work as before.
 */
export const LocationConsentGate: React.FC = () => {
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const allowRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isTrackingAllowed(window.location.hostname, window.location.pathname)) return
    if (!('geolocation' in navigator)) return
    if (getLocationPreference() !== null) return

    let cancelled = false
    let timer: number | undefined

    // If the visitor has already blocked this site in their browser, respect
    // that decision and do not show a prompt that could not succeed.
    void getBrowserLocationPermission().then((permission) => {
      if (cancelled) return
      if (permission === 'denied') {
        declineLocation()
        return
      }
      timer = window.setTimeout(() => setOpen(true), PROMPT_DELAY_MS)
    })

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const onChanged = () => {
      if (getLocationPreference() !== null) return
      void getBrowserLocationPermission().then((permission) => {
        if (permission === 'denied') {
          declineLocation()
          return
        }
        setOpen(true)
      })
    }
    window.addEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, onChanged)
  }, [])

  function decline() {
    if (busy) return
    declineLocation()
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

  const allow = async () => {
    if (busy) return
    setError(null)
    setBusy(true)
    try {
      const coords = await getCurrentCoordinates()
      const profile = await resolveRegionalProfile(coords)
      grantLocation(profile)

      // Visitor analytics is a separate preference, off by default.
      if (getAnalyticsLocationConsent()) {
        void sendLocationEmail({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        })
      }

      setBusy(false)
      setOpen(false)
      notify(
        'success',
        'Location enabled',
        profile ? `Region set to ${describeRegion(profile)}.` : 'Location access allowed.',
      )
    } catch (err: any) {
      setBusy(false)
      if (err?.code === 1) {
        // Browser permission denied. Continue normally and do not re-prompt.
        declineLocation()
        setOpen(false)
        return
      }
      setError('Could not access location. Try again or continue without it.')
    }
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
            initial={reducedMotion ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-sm rounded-3xl glass border border-line-strong shadow-float p-6"
          >
            <button
              onClick={() => !busy && decline()}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-muted hover:bg-accent-soft hover:text-ink transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-5" aria-hidden="true">
                <span className="absolute inset-0 rounded-full border border-line" />
                <span className="absolute inset-[7px] rounded-full border border-line" />
                <span className="absolute inset-0 rounded-full bg-accent-soft blur-xl" />
                <span className="relative w-20 h-20 rounded-full glass border border-line-strong flex items-center justify-center">
                  <Globe2 className="w-8 h-8 text-ink" />
                </span>
              </div>

              <h2
                id="location-consent-title"
                className="text-[22px] font-semibold text-ink tracking-tight leading-tight"
              >
                Allow location access?
              </h2>
            </div>

            {error && (
              <p
                className="text-xs text-ink mt-4 rounded-xl border border-line bg-inset px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="mt-5 space-y-2">
              <Button ref={allowRef} onClick={allow} disabled={busy} className="w-full">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {busy ? 'Allowing…' : 'Allow'}
              </Button>
              <Button variant="secondary" onClick={decline} disabled={busy} className="w-full">
                Not now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
