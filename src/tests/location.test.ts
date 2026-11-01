import { describe, it, expect } from 'vitest'
import {
  buildRegionalContextInstruction,
  describeRegion,
  normalizeRegionalProfile,
} from '../services/location'

describe('regional profile privacy', () => {
  it('keeps only coarse region fields and drops coordinates', () => {
    const profile = normalizeRegionalProfile({
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'Lagos',
      city: 'Ikeja',
      latitude: 6.6,
      longitude: 3.35,
      accuracy: 10,
    })
    expect(profile).toEqual({
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'Lagos',
      updatedAt: expect.any(Number),
    })
    expect(profile).not.toHaveProperty('latitude')
    expect(profile).not.toHaveProperty('longitude')
    expect(profile).not.toHaveProperty('city')
  })

  it('rejects profiles without a country', () => {
    expect(normalizeRegionalProfile({ region: 'Lagos' })).toBeUndefined()
    expect(normalizeRegionalProfile(null)).toBeUndefined()
    expect(normalizeRegionalProfile('Nigeria')).toBeUndefined()
  })

  it('formats a readable region without duplicates', () => {
    expect(describeRegion({ country: 'Nigeria', region: 'Lagos' })).toBe('Lagos, Nigeria')
    expect(describeRegion({ country: 'Singapore' })).toBe('Singapore')
    expect(describeRegion({ country: 'Singapore', region: 'Singapore' })).toBe('Singapore')
    expect(describeRegion(null)).toBe('')
  })
})

describe('regional AI context', () => {
  it('returns nothing without a region', () => {
    expect(buildRegionalContextInstruction(null)).toBe('')
    expect(buildRegionalContextInstruction({ country: '' })).toBe('')
  })

  it('uses only the coarse region and asks the model to ignore it when irrelevant', () => {
    const text = buildRegionalContextInstruction({ country: 'Nigeria', region: 'Lagos' })
    expect(text).toContain('Lagos, Nigeria')
    expect(text.toLowerCase()).toContain('only if')
    expect(text.toLowerCase()).toContain('ignore')
    expect(text.toLowerCase()).toContain('do not invent')
    expect(text).not.toMatch(/latitude|longitude|coordinates/i)
  })
})
