export interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  timeoutMs: number
}

export const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 2,
  baseDelayMs: 450,
  maxDelayMs: 4000,
  timeoutMs: 45000,
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Exponential backoff with full jitter, bounded. */
export function backoffDelay(attempt: number, opts: RetryOptions, retryAfterMs?: number): number {
  if (retryAfterMs && retryAfterMs > 0) return Math.min(retryAfterMs, opts.maxDelayMs)
  const exp = Math.min(opts.maxDelayMs, opts.baseDelayMs * Math.pow(2, attempt))
  return Math.round(Math.random() * exp)
}

/** Parse Retry-After header / retryDelay string into milliseconds. */
export function parseRetryAfter(err: any): number | undefined {
  const raw =
    err?.response?.headers?.['retry-after'] ??
    err?.headers?.['retry-after'] ??
    err?.retryAfter ??
    err?.error?.details?.find?.((d: any) => d?.retryDelay)?.retryDelay
  if (!raw) return undefined
  if (typeof raw === 'number') return raw * 1000
  const s = String(raw)
  if (/^\d+(\.\d+)?s$/.test(s)) return parseFloat(s) * 1000
  if (/^\d+$/.test(s)) return parseInt(s, 10) * 1000
  const date = Date.parse(s)
  if (!isNaN(date)) return Math.max(0, date - Date.now())
  return undefined
}

/** Run a function with a bounded timeout. Rejects with a timeout-tagged error. */
export async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  let timer: any
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const e: any = new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`)
      e.name = 'TimeoutError'
      e.status = 408
      controller.abort()
      reject(e)
    }, timeoutMs)
  })
  try {
    return await Promise.race([fn(controller.signal), timeout])
  } finally {
    clearTimeout(timer)
  }
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions,
  onRetry?: (attempt: number, delay: number, err: any) => void,
  retryAfterMs?: number,
): Promise<T> {
  let lastErr: any
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn(attempt)
    } catch (e: any) {
      lastErr = e
      if (attempt === opts.maxRetries) break
      const delay = backoffDelay(attempt, opts, retryAfterMs)
      onRetry?.(attempt + 1, delay, e)
      await sleep(delay)
    }
  }
  throw lastErr
}
