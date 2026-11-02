/**
 * Lightweight bot gate for the automatic visitor email.
 *
 * The visitor notification is triggered by page load, so a crawler with fresh
 * browser storage would otherwise bypass the one-hour localStorage cooldown.
 * This module requires a genuine, trusted interaction and a short dwell time
 * before a notification is allowed.
 *
 * This is deliberately conservative rather than clever. It is not a substitute
 * for provider-side restrictions: EmailJS still recommends restricting allowed
 * origins and, where possible, requiring CAPTCHA on the template.
 */

/** User-agent fragments used by crawlers, previews and automation tooling. */
const AUTOMATED_USER_AGENT =
  /(bot\b|crawler|spider|slurp|headless|phantom|selenium|puppeteer|playwright|cypress|webdriver|curl\/|wget\/|python-requests|python-urllib|aiohttp|axios\/|node-fetch|go-http-client|scrapy|bingpreview|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|telegrambot|discordbot|whatsapp|embedly|quora link preview)/i

/** Events that only a real person produces in normal use. */
const HUMAN_ACTIVITY_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
] as const

export const HUMAN_ACTIVITY_MIN_DWELL_MS = 8_000
export const HUMAN_ACTIVITY_MAX_WAIT_MS = 45_000

export interface BrowserSignals {
  userAgent: string
  webdriver?: boolean
  languages?: readonly string[]
  screenWidth?: number
  screenHeight?: number
}

/**
 * Conservative checks that work without probing, fingerprinting or collecting
 * anything extra from the visitor.
 */
export function isLikelyAutomatedBrowser(signals: BrowserSignals): boolean {
  const userAgent = signals.userAgent.trim()

  if (!userAgent) return true
  if (signals.webdriver === true) return true
  if (AUTOMATED_USER_AGENT.test(userAgent)) return true

  // Browsers normally expose at least one preferred language. Empty lists are
  // common in stripped-down automation environments.
  if (signals.languages && signals.languages.length === 0) return true

  if (typeof signals.screenWidth === 'number' && signals.screenWidth <= 0) return true
  if (typeof signals.screenHeight === 'number' && signals.screenHeight <= 0) return true

  return false
}

export function readBrowserSignals(): BrowserSignals {
  if (typeof navigator === 'undefined') {
    return { userAgent: '', languages: [], screenWidth: 0, screenHeight: 0 }
  }

  return {
    userAgent: navigator.userAgent,
    webdriver: navigator.webdriver === true,
    languages: navigator.languages,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : undefined,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : undefined,
  }
}

/**
 * Embeds, previews and prerendered documents should never trigger the
 * notification on their own.
 */
export function isIneligibleDocumentContext(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true

  try {
    if (window.top !== window.self) return true
  } catch {
    // A cross-origin parent means this document is embedded.
    return true
  }

  const prerendering = (document as Document & { prerendering?: boolean }).prerendering
  return prerendering === true
}

export interface HumanActivityOptions {
  minDwellMs?: number
  maxWaitMs?: number
  now?: () => number
}

/**
 * Resolve true only after a trusted interaction and a minimum dwell time.
 *
 * Synthetic events (event.isTrusted === false) do not count. If no interaction
 * happens within the maximum wait window, the gate resolves false and no
 * notification is sent for this page load.
 */
export function waitForHumanActivity(options: HumanActivityOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false)
  }

  const minDwellMs = options.minDwellMs ?? HUMAN_ACTIVITY_MIN_DWELL_MS
  const maxWaitMs = options.maxWaitMs ?? HUMAN_ACTIVITY_MAX_WAIT_MS
  const now = options.now ?? Date.now
  const startedAt = now()

  return new Promise<boolean>((resolve) => {
    let settled = false
    let engaged = false
    let settleTimer: number | undefined
    let maxWaitTimer: number | undefined

    const cleanup = () => {
      for (const eventName of HUMAN_ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity)
      }
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (settleTimer) window.clearTimeout(settleTimer)
      if (maxWaitTimer) window.clearTimeout(maxWaitTimer)
    }

    const finish = (allowed: boolean) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(allowed)
    }

    const finishIfReady = () => {
      if (document.visibilityState !== 'visible') return
      if (engaged && now() - startedAt >= minDwellMs) finish(true)
    }

    function onActivity(event: Event) {
      if (settled || engaged) return
      // Untrusted events can be dispatched by scripts and do not prove a
      // person is present.
      if (!event.isTrusted) return
      if (document.visibilityState !== 'visible') return

      engaged = true
      const remaining = Math.max(0, minDwellMs - (now() - startedAt))
      settleTimer = window.setTimeout(finishIfReady, remaining)
    }

    function onVisibilityChange() {
      // If the tab is backgrounded before the gate completes, skip this load
      // rather than sending from a tab the visitor is not looking at.
      if (document.visibilityState === 'hidden') finish(false)
    }

    for (const eventName of HUMAN_ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    maxWaitTimer = window.setTimeout(() => finish(false), maxWaitMs)
  })
}
