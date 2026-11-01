import { describe, it, expect } from 'vitest'
import { classifyConnectionFailure, connectionFailureMessage } from '../services/ai/connection'

function statusError(status: number, message: string) {
  const err: any = new Error(message)
  err.status = status
  return err
}

describe('AI connection error messages', () => {
  it('maps an invalid key to a friendly authentication message', () => {
    const failure = classifyConnectionFailure(statusError(401, 'API key not valid'))
    expect(failure.kind).toBe('auth')
    expect(failure.message).toBe('Invalid API key. Double-check that you copied the entire key.')
  })

  it('maps quota and rate limits to a usage-limit message', () => {
    const failure = classifyConnectionFailure(
      statusError(429, 'Resource exhausted: quota exceeded for this project'),
    )
    expect(failure.kind).toBe('quota')
    expect(failure.message).toContain('usage limit')
    expect(failure.message).toContain('Google AI Studio')
  })

  it('maps unknown models to a model message', () => {
    const failure = classifyConnectionFailure(statusError(404, 'models/foo is not found'))
    expect(failure.kind).toBe('model')
    expect(failure.message).toBe('Your current model is unavailable. Try another compatible model.')
  })

  it('maps timeouts and aborts to a retry message', () => {
    expect(classifyConnectionFailure(new Error('Connection test timed out.')).kind).toBe('timeout')
    const abort = new Error('The operation was aborted.')
    abort.name = 'AbortError'
    expect(classifyConnectionFailure(abort).kind).toBe('timeout')
    expect(connectionFailureMessage('timeout')).toBe('Connection timed out. Please try again.')
  })

  it('maps network failures separately', () => {
    const failure = classifyConnectionFailure(new Error('fetch failed'))
    expect(failure.kind).toBe('network')
    expect(failure.message).toContain('internet connection')
  })

  it('falls back to a safe generic message for unknown errors', () => {
    const failure = classifyConnectionFailure({ weird: true })
    expect(failure.kind).toBe('unknown')
    expect(failure.message).toContain('copied the entire key')
  })

  it('never exposes the API key in diagnostics', () => {
    const key = 'AIzaabcdefghijklmnopqrstuvwxyz0123456789'
    const failure = classifyConnectionFailure(
      statusError(401, `API key not valid: ${key} key=${key}`),
    )
    expect(failure.message).not.toContain(key)
    expect(failure.technical ?? '').not.toContain(key)
    expect(failure.technical ?? '').toContain('[redacted]')
  })
})
