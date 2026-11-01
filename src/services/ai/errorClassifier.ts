import type { AIError, AIErrorCode } from '../../types/ai'

/** Extract an HTTP-ish status from a variety of Gemini SDK error shapes. */
function extractStatus(err: any): number | undefined {
  if (!err) return undefined
  const candidates = [err.status, err.code, err.httpStatus, err.response?.status, err.error?.code, err.error?.status]
  for (const c of candidates) {
    if (typeof c === 'number' && c >= 100 && c <= 599) return c
    if (typeof c === 'string' && /^\d{3}$/.test(c)) return Number(c)
  }
  return undefined
}

function messageOf(err: any): string {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  return String(err.message ?? err.error?.message ?? err.statusText ?? err)
}

export function classifyError(err: any): AIError {
  const message = messageOf(err)
  const status = extractStatus(err)
  const lower = message.toLowerCase()

  const notFound = status === 404 || /not found|not_found|does not exist|unsupported.*model/i.test(lower)
  const authError = status === 401 || status === 403 || /api key not valid|api_key_invalid|permission denied|unauthorized|invalid.*key|forbidden/i.test(lower)
  const rateLimited = status === 429 || /rate limit|resource_exhausted|too many requests/i.test(lower)
  const quotaExhausted = /quota|billing|exceeded.*limit/i.test(lower)
  const modelIncompatible = /does not support|not supported for|unsupported.*(parameter|modality|method|model)|incompatible.*model|model.*incompatible/i.test(lower)
  const timeout = status === 408 || /timeout|timed out|etimedout|deadline/i.test(lower)
  const network = /network|fetch failed|failed to fetch|offline|connection|enotfound|econnreset/i.test(lower)

  let code: AIErrorCode = 'unknown'
  if (status === 503) code = '503'
  else if (status === 429) code = '429'
  else if (status === 500) code = '500'
  else if (status === 502) code = '502'
  else if (status === 504) code = '504'
  else if (status === 408) code = '408'
  else if (status === 404) code = '404'
  else if (status === 400) code = '400'
  else if (status === 401) code = '401'
  else if (status === 403) code = '403'
  else if (timeout) code = 'timeout'
  else if (network) code = 'network'
  else if (notFound) code = '404'
  else if (authError) code = '401'
  else if (rateLimited) code = '429'
  else if (modelIncompatible) code = '400'

  // 400 is only retryable/swappable when it is a model compatibility issue.
  const retryable =
    code === '503' || code === '429' || code === '500' || code === '502' || code === '504' ||
    code === '408' || code === 'timeout' || code === 'network' || notFound ||
    (code === '400' && modelIncompatible)

  return {
    code,
    httpStatus: status,
    message,
    retryable,
    authError,
    notFound,
    rateLimited,
    quotaExhausted,
    modelIncompatible,
    raw: err,
  }
}

export function friendlyErrorMessage(e: AIError): string {
  switch (e.code) {
    case '401':
    case '403':
      return 'Your API key was rejected. Check the key, its permissions and the project it belongs to, then try again.'
    case '429':
      return e.quotaExhausted
        ? 'Your Gemini quota appears to be exhausted. Quotas may be shared across models, so switching models may not help. Check your provider plan and try again later.'
        : 'Gemini is rate-limiting requests right now. Studifree will try a compatible model. If this persists, wait a moment and try again.'
    case '503':
    case '502':
    case '504':
      return 'Gemini is temporarily unavailable. Studifree will try a compatible model automatically.'
    case '404':
      return 'The selected model is not available to your account. Studifree will refresh the model list and try a compatible model.'
    case '400':
      return e.modelIncompatible
        ? 'That model does not support this request. Studifree will try a compatible model.'
        : 'The request was rejected as invalid. This is usually not fixed by switching models. Please adjust the input and try again.'
    case 'network':
      return 'We could not reach Gemini. Check your internet connection. Your work has been preserved.'
    case 'timeout':
      return 'Gemini took too long to respond. Studifree will try again or switch to a compatible model.'
    default:
      return 'Something went wrong while generating content. Your study material has been preserved. Please try again.'
  }
}

/** Never leak API keys in a user-facing error string. */
export function redactSecrets(input: string, apiKey?: string): string {
  let out = input
  if (apiKey && apiKey.length > 6) out = out.split(apiKey).join('[redacted]')
  out = out.replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[redacted]')
  out = out.replace(/key=[^&\s]+/gi, 'key=[redacted]')
  // strip stack traces
  out = out.replace(/\n\s*at\s+.*$/gm, '')
  return out.slice(0, 600)
}
