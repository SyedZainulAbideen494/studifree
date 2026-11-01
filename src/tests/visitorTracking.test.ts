import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  VISITOR_EMAIL_COOLDOWN_MS,
  VISITOR_EMAIL_SENT_KEY,
  attemptVisitorEmail,
  getLastVisitorEmailSentAt,
  isVisitorEmailCooldownActive,
  recordVisitorEmailSent,
} from '../services/visitorTracking'

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

const MINUTE = 60 * 1000

afterEach(() => {
  vi.restoreAllMocks()
})

describe('visitor email cooldown', () => {
  it('uses a clearly named, timestamp-based localStorage key', () => {
    expect(VISITOR_EMAIL_SENT_KEY).toBe('studifree_last_visitor_email_sent')
    expect(VISITOR_EMAIL_COOLDOWN_MS).toBe(60 * MINUTE)
  })

  it('treats the first visit as outside the cooldown', () => {
    expect(isVisitorEmailCooldownActive(Date.now(), null)).toBe(false)
  })

  it('blocks refresh and return visits before 60 minutes', () => {
    const sentAt = Date.now()
    expect(isVisitorEmailCooldownActive(sentAt + 5 * MINUTE, sentAt)).toBe(true)
    expect(isVisitorEmailCooldownActive(sentAt + 30 * MINUTE, sentAt)).toBe(true)
    expect(isVisitorEmailCooldownActive(sentAt + 59 * MINUTE + 59 * 1000, sentAt)).toBe(true)
  })

  it('allows a new notification at exactly 60 minutes or later', () => {
    const sentAt = Date.now()
    expect(isVisitorEmailCooldownActive(sentAt + 60 * MINUTE, sentAt)).toBe(false)
    expect(isVisitorEmailCooldownActive(sentAt + 61 * MINUTE, sentAt)).toBe(false)
  })

  it('treats a future timestamp as an active cooldown after a clock change', () => {
    const now = Date.now()
    expect(isVisitorEmailCooldownActive(now, now + 10 * MINUTE)).toBe(true)
  })

  it('records and reads a numeric timestamp', () => {
    const storage = memoryStorage()
    expect(recordVisitorEmailSent(123456, storage)).toBe(true)
    expect(storage.getItem(VISITOR_EMAIL_SENT_KEY)).toBe('123456')
    expect(getLastVisitorEmailSentAt(storage)).toBe(123456)
  })

  it('ignores malformed stored values', () => {
    const storage = memoryStorage()
    storage.setItem(VISITOR_EMAIL_SENT_KEY, 'not-a-date')
    expect(getLastVisitorEmailSentAt(storage)).toBeNull()
  })
})

describe('visitor email sending', () => {
  it('sends on the first visit and starts the cooldown only after success', async () => {
    const storage = memoryStorage()
    const deliver = vi.fn().mockResolvedValue(undefined)
    const now = 10_000

    await expect(attemptVisitorEmail(deliver, { now: () => now, storage })).resolves.toBe('sent')
    expect(deliver).toHaveBeenCalledTimes(1)
    expect(getLastVisitorEmailSentAt(storage)).toBe(now)

    await expect(attemptVisitorEmail(deliver, { now: () => now + 5 * MINUTE, storage })).resolves.toBe(
      'cooldown',
    )
    await expect(attemptVisitorEmail(deliver, { now: () => now + 30 * MINUTE, storage })).resolves.toBe(
      'cooldown',
    )
    expect(deliver).toHaveBeenCalledTimes(1)

    await expect(attemptVisitorEmail(deliver, { now: () => now + 60 * MINUTE, storage })).resolves.toBe(
      'sent',
    )
    expect(deliver).toHaveBeenCalledTimes(2)
    expect(getLastVisitorEmailSentAt(storage)).toBe(now + 60 * MINUTE)
  })

  it('does not start a cooldown when EmailJS fails, so a later visit can retry', async () => {
    const storage = memoryStorage()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const deliver = vi.fn().mockRejectedValueOnce(new Error('EmailJS request failed'))

    await expect(attemptVisitorEmail(deliver, { now: () => 10_000, storage })).resolves.toBe('failed')
    expect(getLastVisitorEmailSentAt(storage)).toBeNull()

    deliver.mockResolvedValueOnce(undefined)
    await expect(attemptVisitorEmail(deliver, { now: () => 10_500, storage })).resolves.toBe('sent')
    expect(getLastVisitorEmailSentAt(storage)).toBe(10_500)
    expect(errorSpy).toHaveBeenCalled()
  })

  it('deduplicates concurrent requests, as React StrictMode would', async () => {
    const storage = memoryStorage()
    let release: (() => void) | undefined
    const deliver = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )

    const first = attemptVisitorEmail(deliver, { now: () => 10_000, storage })
    const second = attemptVisitorEmail(deliver, { now: () => 10_000, storage })

    await expect(second).resolves.toBe('in-flight')
    release?.()
    await expect(first).resolves.toBe('sent')
    expect(deliver).toHaveBeenCalledTimes(1)
    expect(getLastVisitorEmailSentAt(storage)).toBe(10_000)
  })

  it('does not send when local storage is unavailable', async () => {
    const deliver = vi.fn().mockResolvedValue(undefined)
    await expect(attemptVisitorEmail(deliver, { now: () => 1, storage: null })).resolves.toBe(
      'unavailable',
    )
    expect(deliver).not.toHaveBeenCalled()
  })
})
