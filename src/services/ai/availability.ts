import type { ProviderConfig } from '../../types'
import { getAdapter } from './providerAdapter'
import { modelRegistry } from './modelRegistry'
import { useAiUiStore } from '../../store/useAiUiStore'

export type AiStatus =
  | 'missing'
  | 'invalid-provider'
  | 'invalid-model'
  | 'unverified'
  | 'connected'
  | 'failed'

export interface AiVerification {
  /** Non-reversible fingerprint. The key itself is never stored here. */
  fingerprint: string
  model: string
  ok: boolean
  at: number
  message?: string
}

export interface AiAvailability {
  status: AiStatus
  /** A non-empty key string exists. Not proof that the key works. */
  configured: boolean
  keyPresent: boolean
  providerValid: boolean
  modelValid: boolean
  /** AI calls are expected to work (connected or not tested yet). */
  usable: boolean
  /** The UI should ask the learner to set up / fix AI. */
  requiresSetup: boolean
  message: string
  detail?: string
  apiKey?: string
  provider?: string
  model?: string
  lastCheckedAt?: number
}

const VERIFICATION_KEY = 'studifree:ai:verification'

/** Small, non-reversible hash so a verification result maps to one key. */
export function fingerprintKey(apiKey: string): string {
  let hash = 5381
  for (let i = 0; i < apiKey.length; i++) {
    hash = ((hash << 5) + hash + apiKey.charCodeAt(i)) | 0
  }
  return `k_${(hash >>> 0).toString(36)}_${apiKey.length}`
}

export function readVerification(): AiVerification | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(VERIFICATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.fingerprint === 'string' && typeof parsed?.model === 'string') return parsed
    return null
  } catch {
    return null
  }
}

function writeVerification(v: AiVerification): void {
  try {
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(v))
  } catch {
    /* storage may be unavailable */
  }
  useAiUiStore.getState().bumpVerification()
}

export function clearVerification(): void {
  try {
    localStorage.removeItem(VERIFICATION_KEY)
  } catch {
    /* ignore */
  }
  useAiUiStore.getState().bumpVerification()
}

/**
 * Pure evaluation of the configured provider. No network access and no
 * assumption that a key string means a valid key: only a successful test
 * changes the status to "connected".
 */
export function evaluateAiSetup(
  ai: ProviderConfig | undefined,
  verification?: AiVerification | null,
): AiAvailability {
  if (!ai || !ai.apiKey || !ai.apiKey.trim()) {
    return {
      status: 'missing',
      configured: false,
      keyPresent: false,
      providerValid: false,
      modelValid: false,
      usable: false,
      requiresSetup: true,
      message: 'Add your Gemini API key to unlock AI-powered learning.',
    }
  }

  const apiKey = ai.apiKey.trim()
  const provider = ai.provider
  const model = (ai.model || '').trim()

  if (provider !== 'gemini') {
    return {
      status: 'invalid-provider',
      configured: true,
      keyPresent: true,
      providerValid: false,
      modelValid: !!model,
      usable: false,
      requiresSetup: true,
      message: 'The selected AI provider is not supported. Choose Google Gemini in AI Setup.',
      provider,
      model,
      apiKey,
    }
  }

  if (!model) {
    return {
      status: 'invalid-model',
      configured: true,
      keyPresent: true,
      providerValid: true,
      modelValid: false,
      usable: false,
      requiresSetup: true,
      message: 'Choose a Gemini model in AI Setup.',
      provider,
      model,
      apiKey,
    }
  }

  if (verification && verification.fingerprint === fingerprintKey(apiKey) && verification.model === model) {
    if (verification.ok) {
      return {
        status: 'connected',
        configured: true,
        keyPresent: true,
        providerValid: true,
        modelValid: true,
        usable: true,
        requiresSetup: false,
        message: 'AI is connected and ready.',
        provider,
        model,
        apiKey,
        lastCheckedAt: verification.at,
      }
    }
    return {
      status: 'failed',
      configured: true,
      keyPresent: true,
      providerValid: true,
      modelValid: true,
      usable: false,
      requiresSetup: true,
      message: 'Your API key or project needs attention.',
      detail: verification.message,
      provider,
      model,
      apiKey,
      lastCheckedAt: verification.at,
    }
  }

  return {
    status: 'unverified',
    configured: true,
    keyPresent: true,
    providerValid: true,
    modelValid: true,
    usable: true,
    requiresSetup: false,
    message: 'A key is saved. Run Test connection to confirm it works.',
    provider,
    model,
    apiKey,
  }
}

/** Evaluate the saved settings against cached verification and the registry. */
export function getAiAvailability(settings: { ai?: ProviderConfig }): AiAvailability {
  const result = evaluateAiSetup(settings.ai, readVerification())
  if (!result.apiKey || !result.model) return result

  const meta = modelRegistry.getModel(result.model)
  if (meta?.deprecated) {
    return {
      ...result,
      status: 'invalid-model',
      usable: false,
      requiresSetup: true,
      message: `${meta.displayName} is no longer available. Choose another model in AI Setup.`,
    }
  }
  return result
}

export function markAiVerification(
  apiKey: string,
  model: string,
  ok: boolean,
  message?: string,
): void {
  if (!apiKey.trim() || !model.trim()) return
  writeVerification({
    fingerprint: fingerprintKey(apiKey.trim()),
    model: model.trim(),
    ok,
    at: Date.now(),
    message,
  })
}

export interface ConnectionTestResult {
  ok: boolean
  ms: number
  text?: string
  error?: string
}

/** Test the configured key/model through the shared provider adapter. */
export async function verifyAiConnection(apiKey: string, model: string): Promise<ConnectionTestResult> {
  if (!apiKey.trim()) {
    return { ok: false, ms: 0, error: 'No API key is configured.' }
  }
  if (!model.trim()) {
    return { ok: false, ms: 0, error: 'No model is selected.' }
  }

  const started = Date.now()
  let timeoutId: number | undefined
  try {
    const result = await Promise.race([
      getAdapter('gemini').testModel(apiKey.trim(), model.trim()),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('Connection test timed out.')), 20000)
      }),
    ])
    if (timeoutId) window.clearTimeout(timeoutId)
    const ms = result.ms || Date.now() - started
    if (result.ok) {
      modelRegistry.recordSuccess(model.trim(), ms)
      markAiVerification(apiKey, model, true)
      return { ok: true, ms, text: result.text }
    }
    const error = result.error ?? 'The model did not respond.'
    modelRegistry.recordFailure(model.trim(), error)
    markAiVerification(apiKey, model, false, error)
    return { ok: false, ms, error }
  } catch (e: any) {
    if (timeoutId) window.clearTimeout(timeoutId)
    const error = e?.message ?? String(e)
    markAiVerification(apiKey, model, false, error)
    return { ok: false, ms: Date.now() - started, error }
  }
}
