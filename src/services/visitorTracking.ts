import emailjs from '@emailjs/browser'
import { getAnalyticsLocationConsent, getLocationStatus } from './location'
import {
  isIneligibleDocumentContext,
  isLikelyAutomatedBrowser,
  readBrowserSignals,
  waitForHumanActivity,
} from './visitorBotProtection'

const SERVICE_ID = 'service_zijppum'
const TEMPLATE_ID = 'template_bfaicga'
const PUBLIC_KEY = 'oiGY-u7t8BC8uN_Zf'

/**
 * The visitor notification is deliberately throttled to at most one email per
 * hour per browser. The timestamp is written only after EmailJS confirms that
 * the message was accepted, so a failed attempt does not start a cooldown.
 */
export const VISITOR_EMAIL_SENT_KEY = 'studifree_last_visitor_email_sent'
export const VISITOR_EMAIL_COOLDOWN_MS = 60 * 60 * 1000

export type VisitorEmailOutcome =
  | 'sent'
  | 'cooldown'
  | 'in-flight'
  | 'unavailable'
  | 'failed'
  | 'excluded'
  | 'bot'

/** Visitor information sent with the automatic page-load notification. */
export interface VisitorInfo {
  time: string
  page: string
  ip: string
  browser: string
  language: string
  screen: string
  timezone: string
  referrer: string
  platform: string
}

function resolveStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getLastVisitorEmailSentAt(storage: Storage | null = resolveStorage()): number | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(VISITOR_EMAIL_SENT_KEY)
    if (!raw) return null
    const timestamp = Number(raw)
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
  } catch {
    return null
  }
}

/**
 * A cooldown is active while less than one hour has elapsed. A timestamp in
 * the future (for example after a system clock change) is also treated as an
 * active cooldown so the visitor is never spammed.
 */
export function isVisitorEmailCooldownActive(
  now: number,
  lastSentAt: number | null,
  cooldownMs: number = VISITOR_EMAIL_COOLDOWN_MS,
): boolean {
  if (lastSentAt === null || !Number.isFinite(lastSentAt)) return false
  return now - lastSentAt < cooldownMs
}

export function recordVisitorEmailSent(
  timestamp: number = Date.now(),
  storage: Storage | null = resolveStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(VISITOR_EMAIL_SENT_KEY, String(timestamp))
    return true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Duplicate prevention                                                */
/* ------------------------------------------------------------------ */

/**
 * Pure guard used instead of reading window directly so the rules can be
 * tested. Deployment only: localhost and /dev routes are excluded.
 */
export function isTrackingAllowed(hostname: string, pathname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false
  if (pathname.startsWith('/dev')) return false
  return true
}

let visitorEmailInFlight = false
let visitorTrackingStarted = false

/**
 * Shared guard for the cooldown, in-flight requests and success-only timestamp
 * recording. Exported separately from `sendVisitorEmail` so the timing rules
 * can be tested without a browser or a network connection.
 */
export async function attemptVisitorEmail(
  deliver: () => Promise<unknown>,
  options: { now?: () => number; storage?: Storage | null } = {},
): Promise<VisitorEmailOutcome> {
  const now = options.now ?? Date.now
  const storage = options.storage === undefined ? resolveStorage() : options.storage

  if (!storage) return 'unavailable'
  if (visitorEmailInFlight) return 'in-flight'
  if (isVisitorEmailCooldownActive(now(), getLastVisitorEmailSentAt(storage))) return 'cooldown'

  visitorEmailInFlight = true
  try {
    await deliver()
    // Only a confirmed send starts the one-hour cooldown.
    recordVisitorEmailSent(now(), storage)
    return 'sent'
  } catch (error) {
    console.error('Visitor notification failed:', error)
    return 'failed'
  } finally {
    visitorEmailInFlight = false
  }
}

/** Collect the shared visitor fields once, without sending anything. */
export async function collectVisitorInfo(): Promise<VisitorInfo> {
  let ip = 'Unavailable'
  try {
    const data = await fetch('https://api.ipify.org?format=json').then((r) => r.json())
    if (data?.ip) ip = String(data.ip)
  } catch {
    /* IP is helpful but never required */
  }

  return {
    time: new Date().toLocaleString(),
    page: window.location.href,
    ip,
    browser: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || 'Direct',
    platform: navigator.platform,
  }
}

/**
 * Send the page-load visitor notification. The notification contains no
 * location data; location analytics is a completely separate, explicit action.
 */
export async function sendVisitorEmail(): Promise<VisitorEmailOutcome> {
  if (typeof window === 'undefined') return 'unavailable'
  if (!isTrackingAllowed(window.location.hostname, window.location.pathname)) return 'excluded'
  if (isIneligibleDocumentContext()) return 'excluded'
  if (isLikelyAutomatedBrowser(readBrowserSignals())) return 'bot'
  if (document.visibilityState !== 'visible') return 'excluded'

  return attemptVisitorEmail(async () => {
    const info = await collectVisitorInfo()
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...info }, PUBLIC_KEY)
    console.log('Visitor email sent')
  })
}

/**
 * Schedule the notification during idle time so it never blocks the page.
 * `main.tsx` calls this once outside React; the local guard also protects
 * against React StrictMode or a duplicate bootstrap calling it twice.
 */
export function initVisitorTracking(): void {
  if (typeof window === 'undefined') return
  if (!isTrackingAllowed(window.location.hostname, window.location.pathname)) return
  if (isIneligibleDocumentContext()) return
  if (isLikelyAutomatedBrowser(readBrowserSignals())) return
  if (visitorTrackingStarted) return
  visitorTrackingStarted = true

  if (isVisitorEmailCooldownActive(Date.now(), getLastVisitorEmailSentAt())) return

  // Register the human-activity gate immediately so interactions that happen
  // while the page is still loading are counted. No notification is sent until
  // a trusted interaction has occurred and the minimum dwell time has passed.
  const humanActivity = waitForHumanActivity()

  const run = async () => {
    if (!(await humanActivity)) return
    await sendVisitorEmail()
  }

  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
  ).requestIdleCallback
  if (typeof idle === 'function') idle(() => void run(), { timeout: 3000 })
  else window.setTimeout(() => void run(), 900)
}

/* ------------------------------------------------------------------ */
/* Optional location analytics (separate explicit consent)             */
/* ------------------------------------------------------------------ */

/**
 * Separate notification for visitor analytics. This is never sent just
 * because location personalisation was granted: the visitor must also have
 * switched on the distinct analytics preference in Settings.
 */
export async function sendLocationEmail(coords: {
  latitude: number
  longitude: number
  accuracy: number
}): Promise<boolean> {
  if (!getAnalyticsLocationConsent()) return false
  if (isLikelyAutomatedBrowser(readBrowserSignals())) return false
  // Two independent choices must both be on: personalisation was allowed and
  // the visitor separately opted into including a location in analytics.
  if (getLocationStatus() !== 'granted') return false

  try {
    const info = await collectVisitorInfo()
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        ...info,
        location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        latitude: coords.latitude.toFixed(5),
        longitude: coords.longitude.toFixed(5),
        location_accuracy: `${Math.round(coords.accuracy)} m`,
        consent: 'Granted — separate visitor-analytics consent',
      },
      PUBLIC_KEY,
    )
    return true
  } catch (err) {
    console.error('Location email failed:', err)
    return false
  }
}
