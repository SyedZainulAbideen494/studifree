import { describe, it, expect, beforeEach } from 'vitest'
import { classifyError, redactSecrets } from '../services/ai/errorClassifier'
import { backoffDelay, DEFAULT_RETRY, parseRetryAfter } from '../services/ai/retryPolicy'
import { fallbackManager } from '../services/ai/fallbackManager'
import { executeAI, NoApiKeyError } from '../services/ai/requestManager'
import { registerAdapter } from '../services/ai/providerAdapter'
import { modelRegistry } from '../services/ai/modelRegistry'
import type { AIRequest } from '../types/ai'

function err(status: number, message: string) {
  const e: any = new Error(message)
  e.status = status
  return e
}

describe('error classifier', () => {
  it('classifies 503 as retryable', () => {
    const e = classifyError(err(503, 'Service unavailable'))
    expect(e.code).toBe('503')
    expect(e.retryable).toBe(true)
  })
  it('classifies 429 rate limit', () => {
    const e = classifyError(err(429, 'Resource exhausted: rate limit'))
    expect(e.rateLimited).toBe(true)
  })
  it('classifies 404 model not found', () => {
    const e = classifyError(err(404, 'models/foo is not found'))
    expect(e.notFound).toBe(true)
    expect(e.retryable).toBe(true)
  })
  it('classifies auth errors and stops fallback', () => {
    const e = classifyError(err(401, 'API key not valid'))
    expect(e.authError).toBe(true)
  })
  it('classifies 400 non-model errors as non-retryable', () => {
    const e = classifyError(err(400, 'Invalid argument: bad request formatting'))
    expect(e.retryable).toBe(false)
  })
  it('redacts api keys and stack traces', () => {
    const out = redactSecrets('oops AIzaabcdefghijklmnopqrstuvwxyz key=SECRET\n    at foo', 'SECRET')
    expect(out).not.toContain('SECRET')
    expect(out).not.toContain('AIzaabcdefghijklmnopqrstuvwxyz')
  })
})

describe('retry policy', () => {
  it('respects retry-after', () => {
    expect(parseRetryAfter({ retryAfter: '2s' })).toBe(2000)
  })
  it('backs off within bounds', () => {
    const d = backoffDelay(5, DEFAULT_RETRY)
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThanOrEqual(DEFAULT_RETRY.maxDelayMs)
  })
})

describe('fallback chains', () => {
  beforeEach(() => {
    modelRegistry.clearCache()
    fallbackManager.restoreDefaults()
  })
  it('builds a text chain by default', () => {
    const chain = fallbackManager.buildChain('explain')
    expect(chain.length).toBeGreaterThan(0)
    expect(chain[0]).toBe('gemini-2.5-flash')
  })
  it('keeps image chain separate from text', () => {
    const text = fallbackManager.buildChain('explain')
    const image = fallbackManager.buildChain('image-generate')
    expect(image).not.toEqual(text)
    expect(image.every((id) => /image|imagen|nano/.test(id))).toBe(true)
  })
  it('disabled models are excluded', () => {
    fallbackManager.toggleDisabled('gemini-2.5-flash')
    const chain = fallbackManager.buildChain('explain')
    expect(chain).not.toContain('gemini-2.5-flash')
  })
})

describe('request manager failover', () => {
  const baseReq: AIRequest = { id: 'test', task: 'explain', contents: 'hello' }

  beforeEach(() => {
    modelRegistry.clearCache()
    fallbackManager.restoreDefaults()
  })

  it('throws NoApiKeyError when key is missing', async () => {
    await expect(executeAI(baseReq, '')).rejects.toBeInstanceOf(NoApiKeyError)
  })

  it('primary succeeds', async () => {
    let calls = 0
    registerAdapter({
      id: 'gemini',
      async generateText(_k, model) { calls++; return { text: 'ok', model } },
      async testModel() { return { ok: true, ms: 1 } },
    })
    const res = await executeAI(baseReq, 'key', { retry: { maxRetries: 0, baseDelayMs: 0, delayMs: 0 } as any })
    expect(res.text).toBe('ok')
    expect(calls).toBe(1)
    expect(res.fallbackUsed).toBe(false)
  })

  it('switches to a fallback on 503', async () => {
    let calls = 0
    registerAdapter({
      id: 'gemini',
      async generateText(_k, model) {
        calls++
        if (calls === 1) throw err(503, 'Service unavailable')
        return { text: 'fallback', model }
      },
      async testModel() { return { ok: true, ms: 1 } },
    })
    const res = await executeAI(baseReq, 'key', { retry: { maxRetries: 0, baseDelayMs: 0, delayMs: 0 } as any })
    expect(res.text).toBe('fallback')
    expect(res.fallbackUsed).toBe(true)
  })

  it('stops immediately on auth error', async () => {
    let calls = 0
    registerAdapter({
      id: 'gemini',
      async generateText(_k, model) { calls++; throw err(401, 'API key not valid') },
      async testModel() { return { ok: false, ms: 1 } },
    })
    await expect(executeAI(baseReq, 'key', { retry: { maxRetries: 0, baseDelayMs: 0, delayMs: 0 } as any })).rejects.toBeTruthy()
    expect(calls).toBe(1)
  })

  it('does not switch when automatic switching is disabled', async () => {
    fallbackManager.setAutoFailover(false)
    let calls = 0
    registerAdapter({
      id: 'gemini',
      async generateText(_k, model) { calls++; throw err(503, 'Service unavailable') },
      async testModel() { return { ok: false, ms: 1 } },
    })
    await expect(executeAI(baseReq, 'key', { retry: { maxRetries: 0, baseDelayMs: 0, delayMs: 0 } as any })).rejects.toBeTruthy()
    expect(calls).toBe(1)
  })

  it('validates schema and switches when invalid', async () => {
    let calls = 0
    registerAdapter({
      id: 'gemini',
      async generateText(_k, model) {
        calls++
        return { text: calls === 1 ? 'not json' : '{"ok":true}', model }
      },
      async testModel() { return { ok: true, ms: 1 } },
    })
    const res = await executeAI(baseReq, 'key', {
      retry: { maxRetries: 0, baseDelayMs: 0, delayMs: 0 } as any,
      validate: (t) => JSON.parse(t),
    })
    expect(res.text).toBe('{"ok":true}')
  })
})
