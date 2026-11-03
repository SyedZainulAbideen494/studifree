/**
 * Lightweight bot gate for the automatic visitor email.
 *
 * The notification is never sent when the page opens. It is sent only after
 * the visitor performs a genuine, trusted interaction — scrolling, tapping,
 * clicking, wheeling or typing — while the page is visible in a top-level
 * document. Crawlers with fresh browser storage therefore cannot trigger a
 * notification just by loading the page.
 *
 * This is deliberately conservative rather than clever. It is not a substitute
 * for provider-side restrictions: EmailJS still recommends restricting allowed
 * origins and, where possible, requiring CAPTCHA on the template.
 */

/** User-agent fragments used by crawlers, previews and automation tooling. */
const AUTOMATED_USER_AGENT =
  /(bot\b|crawler|spider|slurp|headless|phantom|selenium|puppeteer|playwright|cypress|webdriver|curl\/|wget\/|python-requests|python-urllib|aiohttp|axios\/|node-fetch|go-http-client|scrapy|bingpreview|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|telegrambot|discordbot|whatsapp|embedly|quora link preview)/i

/**
 * Deliberate interactions that only a real person produces in normal use.
 *
 * `pointermove` is intentionally excluded: hovering alone is not an
 * interaction and must never trigger the notification.
 */
const HUMAN_ACTIVITY_EVENTS = [
  'pointerdown',
  'click',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
] as const

/**
 * Browsers can restore a previous scroll position while a page opens, which
 * dispatches a trusted `scroll` event even though nobody touched the page.
 * Genuine scrolling also produces wheel, touch or pointer events immediately,
 * so a short grace period filters out restoration without missing real use.
 */
const SCROLL_RESTORE_GRACE_MS = 1_500

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

/**
 * Resolve true on the first genuine interaction while the page is visible.
 *
 * Synthetic events (event.isTrusted === false) do not count, hover movement
 * does not count, and nothing is sent until the visitor actually does
 * something. Navigating away before interacting resolves false.
 */
export interface HumanActivityOptions {
  /** Clock used for the scroll-restoration grace period. */
  now?: () => number
  /** How long after opening to ignore bare scroll events. */
  scrollGraceMs?: number
}

export function waitForHumanActivity(options: HumanActivityOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false)
  }

  const now = options.now ?? Date.now
  const scrollGraceMs = options.scrollGraceMs ?? SCROLL_RESTORE_GRACE_MS
  const startedAt = now()

  return new Promise<boolean>((resolve) => {
    let settled = false

    const cleanup = () => {
      for (const eventName of HUMAN_ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity)
      }
      window.removeEventListener('pagehide', onLeave)
    }

    const finish = (allowed: boolean) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(allowed)
    }

    function onActivity(event: Event) {
      if (settled) return
      // Untrusted events can be dispatched by scripts and do not prove a
      // person is present.
      if (!event.isTrusted) return
      if (document.visibilityState !== 'visible') return
      // Ignore scroll events that are only the browser restoring a position.
      if (event.type === 'scroll' && now() - startedAt < scrollGraceMs) return
      finish(true)
    }

    function onLeave() {
      finish(false)
    }

    for (const eventName of HUMAN_ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true })
    }
    window.addEventListener('pagehide', onLeave, { passive: true })
  })
}
