import type { AIRequest, AIResponse, ModelSwitchEvent } from '../../types/ai'
import { classifyError, friendlyErrorMessage, redactSecrets } from './errorClassifier'
import { DEFAULT_RETRY, parseRetryAfter, sleep, withTimeout } from './retryPolicy'
import { modelRegistry } from './modelRegistry'
import { fallbackManager } from './fallbackManager'
import { modelRouter } from './modelRouter'
import { getAdapter } from './providerAdapter'
import { notify, useAiEventsStore } from '../../store/useAiEventsStore'
import { markAiVerification } from './availability'

interface ExecuteOptions {
  /** Validate/parse the raw text. Throw to request a repair then a model switch. */
  validate?: (text: string) => any
  retry?: Partial<typeof DEFAULT_RETRY>
  signal?: AbortSignal
}

interface ActiveRequest {
  promise: Promise<AIResponse>
  startedAt: number
}

const active = new Map<string, ActiveRequest>()

function displayName(id: string) {
  const m = modelRegistry.getModel(id)
  return m?.displayName || id
}

function recordError(task: string, model: string, code: string, description: string, recovery: string, fallbackSucceeded: boolean, switchedTo?: string) {
  useAiEventsStore.getState().recordError({ task, model, code, description, recovery, fallbackSucceeded, switchedTo })
}

function recordSwitch(e: ModelSwitchEvent) {
  useAiEventsStore.getState().recordSwitch(e)
}

export class NoApiKeyError extends Error {
  code = 'NO_API_KEY'
  constructor() {
    super('No Gemini API key is configured.')
    this.name = 'NoApiKeyError'
  }
}

/**
 * Execute an AI request with task-based routing, capability filtering,
 * bounded retries and transparent automatic failover.
 *
 * The original request object is never mutated; every fallback receives the
 * same prompt, source material, schema and style instructions.
 */
export async function executeAI(req: AIRequest, apiKey: string, opts: ExecuteOptions = {}): Promise<AIResponse> {
  if (!apiKey.trim()) throw new NoApiKeyError()

  // De-duplicate identical in-flight requests (prevents double generation).
  const existing = active.get(req.id)
  if (existing) return existing.promise

  const promise = run(req, apiKey, opts)
  active.set(req.id, { promise, startedAt: Date.now() })
  const entry = active.get(req.id)!
  try {
    return await promise
  } finally {
    // only clear if this is still the same entry
    if (active.get(req.id) === entry) active.delete(req.id)
  }
}

async function run(req: AIRequest, apiKey: string, opts: ExecuteOptions): Promise<AIResponse> {
  const retry = { ...DEFAULT_RETRY, ...(opts.retry ?? {}) }
  const route = modelRouter.route({
    task: req.task,
    hint: req.task === 'quiz' ? 'structured' : req.task === 'explain' ? 'balanced' : undefined,
    hasImages: !!req.images?.length,
  })
  let chain = route.chain.filter(Boolean)
  if (!chain.length) {
    throw new Error('No compatible model is available for this task. Refresh models in AI Settings.')
  }
  const originalModel = req.preferredModel || chain[0]
  if (req.preferredModel) {
    chain = [req.preferredModel, ...chain.filter((id) => id !== req.preferredModel)]
  }
  if (!route.autoFailover) chain = chain.slice(0, 1)

  const adapter = getAdapter('gemini')
  let lastError: any = null
  let lastCode = 'unknown'
  let bestError: any = null

  for (let i = 0; i < chain.length; i++) {
    const modelId = chain[i]
    // Verify capability against the live registry when it is populated.
    const meta = modelRegistry.getModel(modelId)
    if (meta && !meta.deprecated && !meta.capabilities.includes(route.capability)) {
      continue
    }

    const isFallback = i > 0
    let attempts = 0
    const maxAttempts = 1 + retry.maxRetries

    while (attempts < maxAttempts) {
      const t0 = Date.now()
      try {
        const out = await withTimeout(
          (signal) => adapter.generateText(apiKey, modelId, req, signal),
          retry.timeoutMs,
        )
        let text = out.text ?? ''
        if (!text.trim()) throw Object.assign(new Error('Empty response from model'), { status: 500 })

        let parsed: any = text
        if (opts.validate) {
          try {
            parsed = opts.validate(text)
          } catch (verr: any) {
            // One controlled repair attempt on the same model.
            try {
              const repairReq: AIRequest = {
                ...req,
                id: `${req.id}:repair`,
                contents: buildRepairContents(req.contents, text, verr?.message ?? 'Invalid JSON'),
              }
              const repaired = await withTimeout((signal) => adapter.generateText(apiKey, modelId, repairReq, signal), retry.timeoutMs)
              parsed = opts.validate(repaired.text ?? '')
              text = repaired.text ?? text
            } catch {
              const e: any = new Error('The model returned content that did not match the required format.')
              e.code = 'SCHEMA'
              throw e
            }
          }
        }

        const duration = Date.now() - t0
        modelRegistry.recordSuccess(modelId, duration)
        markAiVerification(apiKey, modelId, true)

        if (isFallback) {
          const ev: ModelSwitchEvent = {
            timestamp: Date.now(), requestId: req.id, task: req.task,
            fromModel: originalModel, toModel: modelId,
            reason: lastCode, success: true,
          }
          recordSwitch(ev)
          if (route.autoFailover) {
            notify(
              'info',
              'Model switched',
              `Your preferred model was unavailable. Studifree switched to ${displayName(modelId)} so you can continue learning.`,
            )
          }
        }

        return {
          text,
          model: modelId,
          durationMs: duration,
          fallbackUsed: isFallback,
          originalModel,
        }
      } catch (err: any) {
        lastError = err
        const classified = classifyError(err)
        lastCode = classified.code
        const msg = redactSecrets(classified.message, apiKey)
        modelRegistry.recordFailure(modelId, msg)
        recordError(req.task, modelId, classified.code, msg, isFallback ? 'Tried next model' : 'Handled with retry/failover', false)

        if (err?.code === 'SCHEMA') {
          break // try next compatible model
        }

        // Authentication/permission: never cycle models with the same bad key.
        if (classified.authError) {
          markAiVerification(apiKey, modelId, false, msg)
          notify('error', 'API key problem', friendlyErrorMessage(classified), msg)
          throw classified
        }

        // Invalid request that is not model-related: do not blindly switch.
        if (classified.code === '400' && !classified.modelIncompatible) {
          notify('error', 'Request problem', friendlyErrorMessage(classified), msg)
          throw classified
        }

        // Model not found: refresh discovery quietly, then move on.
        if (classified.notFound) {
          modelRegistry.refreshQuietly(apiKey)
          break
        }

        // Quota exhaustion: do not hammer the same model.
        if (classified.rateLimited && classified.quotaExhausted) {
          break
        }

        if (classified.retryable && attempts < maxAttempts - 1) {
          const retryAfter = parseRetryAfter(err)
          const delay = Math.min(retryAfter ?? retry.baseDelayMs * Math.pow(2, attempts) * (0.6 + Math.random() * 0.8), retry.maxDelayMs)
          attempts++
          await sleep(delay)
          continue
        }

        if (!classified.retryable) throw classified
        break // retryable but exhausted retries -> next model
      }
    }

    const c = classifyError(lastError)
    if (!bestError && c.code !== '404' && c.code !== 'unknown') bestError = c
  }

  const finalError = bestError ?? classifyError(lastError)
  const friendly = friendlyErrorMessage(finalError)
  const technical = redactSecrets(finalError.message, apiKey)
  recordError(req.task, chain[chain.length - 1] ?? 'none', finalError.code, technical, 'All compatible models exhausted', false)
  notify('error', 'Generation failed', friendly, technical)
  const e: any = new Error(friendly)
  e.code = finalError.code
  e.technical = technical
  throw e
}

function buildRepairContents(original: any, badText: string, reason: string): any {
  // Keep the original prompt and add a strict repair instruction.
  const originalText = extractFirstText(original)
  return `${originalText}\n\nYour previous response was not valid for the required format: ${reason}.\nFix ONLY the formatting. Preserve every fact, formula and explanation. Return valid JSON only.`
}

function extractFirstText(contents: any): string {
  if (!contents) return ''
  if (typeof contents === 'string') return contents
  if (Array.isArray(contents)) {
    for (const c of contents) {
      if (typeof c === 'string') return c
      if (c?.text) return c.text
      if (c?.parts) {
        const t = c.parts.map((p: any) => p?.text).filter(Boolean).join('\n')
        if (t) return t
      }
    }
  }
  if (contents.text) return contents.text
  if (contents.parts) return contents.parts.map((p: any) => p?.text).filter(Boolean).join('\n')
  return ''
}

export function isNoApiKeyError(e: any): boolean {
  return e?.code === 'NO_API_KEY' || e instanceof NoApiKeyError
}
