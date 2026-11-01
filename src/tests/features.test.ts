import { describe, it, expect } from 'vitest'
import { faqCategories, faqItems, filterFaq } from '../data/faq'
import { evaluateAiSetup, fingerprintKey } from '../services/ai/availability'
import { isTrackingAllowed } from '../services/visitorTracking'
import type { ProviderConfig } from '../types'

const key = 'AIza-test-key'

describe('visitor tracking guards', () => {
  it('excludes localhost and 127.0.0.1', () => {
    expect(isTrackingAllowed('localhost', '/')).toBe(false)
    expect(isTrackingAllowed('127.0.0.1', '/learn')).toBe(false)
  })

  it('excludes /dev routes', () => {
    expect(isTrackingAllowed('studifree.app', '/dev')).toBe(false)
    expect(isTrackingAllowed('studifree.app', '/dev/preview')).toBe(false)
  })

  it('allows deployed pages', () => {
    expect(isTrackingAllowed('studifree.app', '/')).toBe(true)
    expect(isTrackingAllowed('studifree.app', '/learn')).toBe(true)
  })
})

describe('AI availability evaluation', () => {
  const config: ProviderConfig = {
    provider: 'gemini',
    apiKey: key,
    model: 'gemini-2.5-flash',
  }

  it('reports missing when no key exists', () => {
    const result = evaluateAiSetup(undefined)
    expect(result.status).toBe('missing')
    expect(result.requiresSetup).toBe(true)
    expect(result.usable).toBe(false)
  })

  it('does not treat a saved string as a verified key', () => {
    const result = evaluateAiSetup(config)
    expect(result.status).toBe('unverified')
    expect(result.requiresSetup).toBe(false)
    expect(result.usable).toBe(true)
  })

  it('reports connected after a matching successful test', () => {
    const result = evaluateAiSetup(config, {
      fingerprint: fingerprintKey(key),
      model: 'gemini-2.5-flash',
      ok: true,
      at: Date.now(),
    })
    expect(result.status).toBe('connected')
    expect(result.requiresSetup).toBe(false)
  })

  it('reports failure after a matching failed test', () => {
    const result = evaluateAiSetup(config, {
      fingerprint: fingerprintKey(key),
      model: 'gemini-2.5-flash',
      ok: false,
      at: Date.now(),
      message: 'API key not valid',
    })
    expect(result.status).toBe('failed')
    expect(result.requiresSetup).toBe(true)
    expect(result.detail).toBe('API key not valid')
  })

  it('ignores verification for a different key or model', () => {
    const other = evaluateAiSetup(config, {
      fingerprint: fingerprintKey('different-key'),
      model: 'gemini-2.5-flash',
      ok: true,
      at: Date.now(),
    })
    expect(other.status).toBe('unverified')

    const otherModel = evaluateAiSetup(config, {
      fingerprint: fingerprintKey(key),
      model: 'gemini-2.0-flash',
      ok: true,
      at: Date.now(),
    })
    expect(otherModel.status).toBe('unverified')
  })

  it('flags unsupported providers and missing models', () => {
    const badProvider = evaluateAiSetup({ ...config, provider: 'other' as any })
    expect(badProvider.status).toBe('invalid-provider')
    expect(badProvider.requiresSetup).toBe(true)

    const noModel = evaluateAiSetup({ ...config, model: '' })
    expect(noModel.status).toBe('invalid-model')
    expect(noModel.requiresSetup).toBe(true)
  })
})

describe('FAQ data', () => {
  it('has unique ids and non-empty questions and answers', () => {
    const ids = new Set<string>()
    for (const item of faqItems) {
      expect(item.question.trim().length).toBeGreaterThan(0)
      expect(item.answer.trim().length).toBeGreaterThan(0)
      expect(ids.has(item.id)).toBe(false)
      ids.add(item.id)
    }
  })

  it('uses only known categories', () => {
    const ids = new Set(faqCategories.map((c) => c.id))
    for (const item of faqItems) expect(ids.has(item.category)).toBe(true)
  })

  it('filters by category and keyword', () => {
    const ai = filterFaq(faqItems, 'ai-api-keys', '')
    expect(ai.length).toBeGreaterThan(0)
    expect(ai.every((i) => i.category === 'ai-api-keys')).toBe(true)

    const location = filterFaq(faqItems, 'all', 'location')
    expect(location.some((i) => i.id === 'collect-location')).toBe(true)
  })

  it('returns an empty list for unmatched searches', () => {
    expect(filterFaq(faqItems, 'all', 'zzzz-no-match')).toHaveLength(0)
  })
})
