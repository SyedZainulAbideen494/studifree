/**
 * Location personalisation.
 *
 * Privacy rules this module enforces:
 * - The visitor is asked at most once per browser. Their choice is stored in
 *   `studifree_location_consent` with a consent timestamp.
 * - Coordinates are never persisted. Only a coarse country/region is stored.
 * - GPS is only requested after a direct user action (Allow, Refresh region).
 * - The region is only surfaced to features when the visitor has granted
 *   personalisation, and AI features must opt in per request.
 * - Visitor-analytics location sharing is a separate, explicitly stored
 *   preference and is never implied by personalisation consent.
 */

export type LocationStatus = 'granted' | 'declined'

export type BrowserLocationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported'

export interface RegionalProfile {
  country: string
  countryCode?: string
  /** First-level administrative region, for example a state or county. */
  region?: string
  updatedAt: number
}

export interface LocationPreference {
  status: LocationStatus
  profile?: RegionalProfile
  /** When the visitor made the current personalisation choice. */
  consentAt: number
  /** When the stored preference or coarse region was last changed. */
  updatedAt: number
}

/** Canonical consent key requested for this feature. */
export const LOCATION_CONSENT_KEY = 'studifree_location_consent'
/** Backwards-compatible export for code that still refers to the old name. */
export const LOCATION_PREFERENCE_KEY = LOCATION_CONSENT_KEY
export const LOCATION_PREFERENCE_CHANGED_EVENT = 'studifree:location-preference-changed'

const LEGACY_PREFERENCE_KEY = 'studifree:location-preference'
const LEGACY_CONSENT_KEY = 'studifree:location-consent'
const ANALYTICS_CONSENT_KEY = 'studifree:location-analytics-consent'

/**
 * Keep only the coarse fields we actually use. Any latitude/longitude or
 * other extra fields in imported or legacy data are intentionally dropped.
 */
export function normalizeRegionalProfile(input: unknown): RegionalProfile | undefined {
  if (!input || typeof input !== 'object') return undefined
  const raw = input as Record<string, unknown>
  const country = typeof raw.country === 'string' ? raw.country.trim() : ''
  if (!country) return undefined
  const region = typeof raw.region === 'string' ? raw.region.trim() : ''
  const countryCode = typeof raw.countryCode === 'string' ? raw.countryCode.trim() : ''
  const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now()
  return {
    country,
    region: region || undefined,
    countryCode: countryCode || undefined,
    updatedAt,
  }
}

function dispatchChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(LOCATION_PREFERENCE_CHANGED_EVENT))
}

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function parseStoredPreference(raw: string): LocationPreference | null {
  // Very old installations stored a bare string instead of JSON.
  if (raw === 'granted' || raw === 'declined') {
    const now = Date.now()
    return { status: raw, consentAt: now, updatedAt: now }
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed?.status !== 'granted' && parsed?.status !== 'declined') return null
    const updatedAt = typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now()
    const consentAt = typeof parsed.consentAt === 'number' ? parsed.consentAt : updatedAt
    return {
      status: parsed.status,
      profile: parsed.status === 'granted' ? normalizeRegionalProfile(parsed.profile) : undefined,
      consentAt,
      updatedAt,
    }
  } catch {
    return null
  }
}

function persistPreference(preference: LocationPreference): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(LOCATION_CONSENT_KEY, JSON.stringify(preference))
  } catch {
    /* ignore */
  }
}

/**
 * Move older choices into the canonical consent key. The previous keys covered
 * the same location purpose, so an earlier decision is preserved and the
 * visitor is not asked again merely because the key changed.
 */
function migrateLegacyPreference(): LocationPreference | null {
  const storage = safeStorage()
  if (!storage) return null

  try {
    const oldPreference = storage.getItem(LEGACY_PREFERENCE_KEY)
    if (oldPreference) {
      const parsed = parseStoredPreference(oldPreference)
      storage.removeItem(LEGACY_PREFERENCE_KEY)
      if (parsed) {
        persistPreference(parsed)
        return parsed
      }
    }

    const oldConsent = storage.getItem(LEGACY_CONSENT_KEY)
    if (oldConsent === 'granted' || oldConsent === 'declined') {
      const now = Date.now()
      const migrated: LocationPreference = {
        status: oldConsent,
        consentAt: now,
        updatedAt: now,
      }
      storage.removeItem(LEGACY_CONSENT_KEY)
      persistPreference(migrated)
      return migrated
    }
    if (oldConsent) storage.removeItem(LEGACY_CONSENT_KEY)
  } catch {
    return null
  }

  return null
}

export function getLocationPreference(): LocationPreference | null {
  const storage = safeStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(LOCATION_CONSENT_KEY)
    if (raw) {
      const parsed = parseStoredPreference(raw)
      if (parsed) return parsed
      // Remove malformed data so a corrupted value cannot permanently hide the
      // consent prompt.
      storage.removeItem(LOCATION_CONSENT_KEY)
    }
  } catch {
    return null
  }

  return migrateLegacyPreference()
}

export function getLocationStatus(): LocationStatus | null {
  return getLocationPreference()?.status ?? null
}

/** The coarse region, only while personalisation is granted. */
export function getRegionalProfile(): RegionalProfile | null {
  const preference = getLocationPreference()
  if (!preference || preference.status !== 'granted') return null
  return preference.profile ?? null
}

function savePreference(preference: LocationPreference): void {
  persistPreference(preference)
  dispatchChanged()
}

/** Record an explicit "Allow location" choice. */
export function grantLocation(profile?: RegionalProfile, now: number = Date.now()): void {
  savePreference({
    status: 'granted',
    profile: profile ? normalizeRegionalProfile(profile) : undefined,
    consentAt: now,
    updatedAt: now,
  })
}

/** Record an explicit decline or "Maybe later" choice. */
export function declineLocation(now: number = Date.now()): void {
  savePreference({ status: 'declined', consentAt: now, updatedAt: now })
}

/**
 * Change the coarse region without changing the original consent decision.
 * Used when a visitor presses "Refresh region" in Settings.
 */
export function updateRegionalProfile(profile?: RegionalProfile, now: number = Date.now()): void {
  const current = getLocationPreference()
  savePreference({
    status: 'granted',
    profile: profile ? normalizeRegionalProfile(profile) : undefined,
    consentAt: current?.consentAt ?? now,
    updatedAt: now,
  })
}

/** Remove the stored country/region while keeping the consent decision. */
export function clearRegionalProfile(now: number = Date.now()): void {
  const current = getLocationPreference()
  if (!current) return
  savePreference({
    status: current.status,
    profile: undefined,
    consentAt: current.consentAt,
    updatedAt: now,
  })
}

/**
 * Forget the Studifree consent decision so the visitor can make a new one.
 * This does not change the browser's own geolocation permission.
 */
export function clearLocationConsent(): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(LOCATION_CONSENT_KEY)
    storage.removeItem(LEGACY_PREFERENCE_KEY)
    storage.removeItem(LEGACY_CONSENT_KEY)
  } catch {
    /* ignore */
  }
  dispatchChanged()
}

/**
 * Backwards-compatible name for resetting the consent decision. Existing
 * Settings code and tests can keep calling this.
 */
export function clearLocationPreference(): void {
  clearLocationConsent()
}

/* ------------------------------------------------------------------ */
/* Separate visitor-analytics preference                               */
/* ------------------------------------------------------------------ */

export function getAnalyticsLocationConsent(): boolean {
  const storage = safeStorage()
  if (!storage) return false
  try {
    return storage.getItem(ANALYTICS_CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

export function setAnalyticsLocationConsent(granted: boolean): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    if (granted) storage.setItem(ANALYTICS_CONSENT_KEY, 'granted')
    else storage.removeItem(ANALYTICS_CONSENT_KEY)
  } catch {
    /* ignore */
  }
  dispatchChanged()
}

/* ------------------------------------------------------------------ */
/* Browser permission and coarse region lookup                         */
/* ------------------------------------------------------------------ */

/**
 * Check the browser's own geolocation permission. This never prompts and never
 * requests coordinates. It lets the UI respect a revoked browser permission.
 */
export async function getBrowserLocationPermission(): Promise<BrowserLocationPermission> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unsupported'
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
      return status.state
    }
    return 'unsupported'
  } catch {
    return 'unsupported'
  }
}

/** Subscribe to browser permission changes. Returns an unsubscribe function. */
export function watchBrowserLocationPermission(
  onChange: (permission: BrowserLocationPermission) => void,
): () => void {
  let cancelled = false
  let status: PermissionStatus | null = null

  void getBrowserLocationPermission().then((permission) => {
    if (!cancelled) onChange(permission)
  })

  if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return
        status = result
        result.onchange = () => {
          if (status?.state === 'granted' || status?.state === 'denied' || status?.state === 'prompt') {
            onChange(status.state)
          }
        }
      })
      .catch(() => {
        /* permission query is optional */
      })
  }

  return () => {
    cancelled = true
    if (status) status.onchange = null
  }
}

/**
 * Ask the browser for coordinates. This must only be called after an explicit
 * user action such as pressing "Allow location".
 *
 * High accuracy is deliberately off: a country/region only needs a rough fix,
 * so the least precise result the browser is happy to provide is enough.
 */
export function getCurrentCoordinates(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Location is not supported in this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
    )
  })
}

interface ReverseGeocodeResponse {
  countryName?: unknown
  countryCode?: unknown
  principalSubdivision?: unknown
}

/**
 * Convert coordinates into a coarse region using BigDataCloud's public
 * reverse-geocode endpoint. Coordinates are sent to that service only, are
 * held in memory for this request, and are never stored or sent to the AI.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<RegionalProfile | undefined> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 9000)
  try {
    const url =
      'https://api.bigdatacloud.net/data/reverse-geocode-client' +
      `?latitude=${encodeURIComponent(latitude)}` +
      `&longitude=${encodeURIComponent(longitude)}` +
      '&localityLanguage=en'
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return undefined
    const data = (await response.json()) as ReverseGeocodeResponse
    return normalizeRegionalProfile({
      country: data.countryName,
      countryCode: data.countryCode,
      region: data.principalSubdivision,
    })
  } catch {
    return undefined
  } finally {
    window.clearTimeout(timeout)
  }
}

/** Resolve a browser position into the coarse region we keep. */
export async function resolveRegionalProfile(
  coords: GeolocationCoordinates,
): Promise<RegionalProfile | undefined> {
  return reverseGeocode(coords.latitude, coords.longitude)
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

/** Human-readable region, for example "Lagos, Nigeria". */
export function describeRegion(
  profile?: Pick<RegionalProfile, 'country' | 'region'> | null,
): string {
  if (!profile?.country) return ''
  const parts: string[] = []
  for (const part of [profile.region, profile.country]) {
    const value = part?.trim()
    if (value && !parts.includes(value)) parts.push(value)
  }
  return parts.join(', ')
}

export interface RegionalContext {
  country: string
  region?: string
  countryCode?: string
}

/**
 * Prompt fragment for AI features that explicitly opt into regional context.
 * It asks the model to ignore the region when it is irrelevant and never
 * supplies precise coordinates.
 */
export function buildRegionalContextInstruction(
  context?: Pick<RegionalProfile, 'country' | 'region'> | null,
): string {
  const label = describeRegion(context)
  if (!label) return ''
  return [
    `Optional regional context: the learner is in ${label}.`,
    'Use this only if the concept or follow-up genuinely benefits from local, regional or country-specific context, such as local examples or national curriculum conventions.',
    'If it is not relevant, ignore this instruction completely.',
    "Do not assume the learner's school, examination board or curriculum, and do not invent local facts, statistics or requirements.",
  ].join(' ')
}
