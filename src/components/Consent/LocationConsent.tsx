import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  Globe2,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
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

const benefits = [
  {
    icon: BookOpen,
    title: 'Regional learning resources',
    body: 'Local examples and education information when they are genuinely useful.',
  },
  {
    icon: MapPin,
    title: 'Curriculum context',
    body: 'Country-specific conventions and study guidance where relevant.',
  },
  {
    icon: Sparkles,
    title: 'Better AI context',
    body: 'Optional regional context for questions that need local understanding.',
  },
]

/**
 * Optional, consent-first location personalisation.
 *
 * Nothing is requested from the browser until the visitor presses
 * "Allow location". Declining is remembered, and Studifree continues to
 * work exactly as before.
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

    // Check the browser permission first. If the visitor has already blocked
    // this site in their browser, respect that decision and do not show a
    // Studifree prompt that could not succeed.
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

      // Separate visitor-analytics preference, off by default. Personalisation
      // consent alone never sends coordinates anywhere.
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
        'Location personalisation on',
        profile
          ? `Regional context is available for ${describeRegion(profile)} when a feature can use it.`
          : 'Location is allowed, but we could not determine your region just now. You can retry in Settings.',
      )
    } catch (err: any) {
      setBusy(false)
      if (err?.code === 1) {
        // Browser permission denied. Continue normally and do not re-prompt.
        declineLocation()
        setOpen(false)
        return
      }
      setError('We could not get your location. You can try again, or continue without sharing.')
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
            aria-describedby="location-consent-description"
            initial={reducedMotion ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl glass border border-line-strong shadow-float p-6 sm:p-8"
          >
            <button
              onClick={() => !busy && decline()}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-muted hover:bg-accent-soft hover:text-ink transition"
              aria-label="Close and continue without sharing location"
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

              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-inset px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                Optional
              </span>

              <h2
                id="location-consent-title"
                className="mt-3 text-[22px] sm:text-2xl font-semibold text-ink tracking-tight leading-tight"
              >
                Make your learning experience more relevant.
              </h2>

              <div
                id="location-consent-description"
                className="mt-3 space-y-2.5 text-sm text-muted leading-relaxed max-w-md"
              >
                <p>
                  Allow Studifree to access your location to help personalise your experience. Location can
                  help us provide more relevant regional learning resources, local examples,
                  location-specific information and recommendations when they&apos;re useful.
                </p>
                <p>
                  Your location may also help us tailor certain AI-powered responses to your region when the
                  question requires local context.
                </p>
                <p>
                  It&apos;s completely optional. You can continue using Studifree without sharing your
                  location.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-line bg-surface/70 p-3 text-left"
                >
                  <benefit.icon className="w-4 h-4 text-ink" aria-hidden="true" />
                  <p className="text-xs font-medium text-ink mt-2">{benefit.title}</p>
                  <p className="text-[11px] text-faint mt-0.5 leading-relaxed">{benefit.body}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-ink mt-3 rounded-xl border border-line bg-inset px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-5 space-y-2">
              <Button ref={allowRef} onClick={allow} disabled={busy} className="w-full">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {busy ? 'Finding your region…' : 'Allow location'}
              </Button>
              <Button variant="secondary" onClick={decline} disabled={busy} className="w-full">
                Maybe later
              </Button>
            </div>

            <div className="flex items-start justify-center gap-2 mt-4 text-[11px] text-faint leading-relaxed text-center">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Your precise location is only accessed after you give permission through your browser.
              </span>
            </div>

            <p className="text-[11px] text-faint text-center mt-2">
              Asked once per browser. Only a general country or region is stored, and you can change or clear
              this any time in Settings.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
