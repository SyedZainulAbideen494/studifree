import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LOCATION_CONSENT_KEY,
  clearLocationConsent,
  clearRegionalProfile,
  declineLocation,
  getBrowserLocationPermission,
  getLocationPreference,
  grantLocation,
  updateRegionalProfile,
} from '../services/location'

function memoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.has(key) ? values.get(key)! : null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, String(value))
    },
  } as Storage
}

let storage: Storage

beforeEach(() => {
  storage = memoryStorage()
  vi.stubGlobal('window', {
    localStorage: storage,
    dispatchEvent: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('location consent storage', () => {
  it('migrates the previous preference key without losing the choice or region', () => {
    storage.setItem(
      'studifree:location-preference',
      JSON.stringify({
        status: 'granted',
        profile: { country: 'Nigeria', region: 'Lagos', latitude: 6.6, longitude: 3.35 },
        updatedAt: 111,
      }),
    )

    const preference = getLocationPreference()
    expect(preference?.status).toBe('granted')
    expect(preference?.consentAt).toBe(111)
    expect(preference?.profile).toEqual({
      country: 'Nigeria',
      region: 'Lagos',
      updatedAt: expect.any(Number),
    })
    expect(storage.getItem('studifree:location-preference')).toBeNull()
    expect(storage.getItem(LOCATION_CONSENT_KEY)).toContain('"status":"granted"')
  })

  it('migrates the older bare consent key', () => {
    storage.setItem('studifree:location-consent', 'declined')

    const preference = getLocationPreference()
    expect(preference?.status).toBe('declined')
    expect(preference?.consentAt).toEqual(expect.any(Number))
    expect(storage.getItem('studifree:location-consent')).toBeNull()
    expect(storage.getItem(LOCATION_CONSENT_KEY)).toContain('"declined"')
  })

  it('accepts a bare granted value in the canonical key', () => {
    storage.setItem(LOCATION_CONSENT_KEY, 'granted')
    expect(getLocationPreference()?.status).toBe('granted')
  })

  it('stores a granted choice with a consent timestamp and no coordinates', () => {
    grantLocation(
      {
        country: 'Ghana',
        region: 'Greater Accra',
        latitude: 5.6,
        longitude: -0.2,
        accuracy: 12,
      } as never,
      5_000,
    )

    const preference = getLocationPreference()
    expect(preference?.status).toBe('granted')
    expect(preference?.consentAt).toBe(5_000)
    expect(preference?.profile?.country).toBe('Ghana')
    const raw = storage.getItem(LOCATION_CONSENT_KEY) ?? ''
    expect(raw).not.toContain('latitude')
    expect(raw).not.toContain('longitude')
    expect(raw).not.toContain('accuracy')
  })

  it('remembers a decline so the prompt is not shown again', () => {
    declineLocation(7_000)
    expect(getLocationPreference()).toMatchObject({ status: 'declined', consentAt: 7_000 })
  })

  it('keeps the original consent timestamp when refreshing the region', () => {
    grantLocation({ country: 'Kenya', region: 'Nairobi', updatedAt: 1 }, 5_000)
    updateRegionalProfile({ country: 'Kenya', region: 'Mombasa', updatedAt: 2 }, 9_000)

    const preference = getLocationPreference()
    expect(preference?.consentAt).toBe(5_000)
    expect(preference?.updatedAt).toBe(9_000)
    expect(preference?.profile?.region).toBe('Mombasa')
  })

  it('can clear the saved region while keeping the consent decision', () => {
    grantLocation({ country: 'Kenya', region: 'Nairobi', updatedAt: 1 }, 5_000)
    clearRegionalProfile(8_000)

    const preference = getLocationPreference()
    expect(preference?.status).toBe('granted')
    expect(preference?.profile).toBeUndefined()
    expect(preference?.consentAt).toBe(5_000)
  })

  it('clearing the consent allows a new decision without touching browser permission', () => {
    grantLocation({ country: 'Kenya', updatedAt: 1 }, 5_000)
    clearLocationConsent()
    expect(getLocationPreference()).toBeNull()
  })

  it('reports unsupported browser permission when the Permissions API is absent', async () => {
    await expect(getBrowserLocationPermission()).resolves.toBe('unsupported')
  })
})
