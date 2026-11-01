import { classifyError, redactSecrets } from './errorClassifier'

export type ConnectionFailureKind =
  | 'auth'
  | 'quota'
  | 'model'
  | 'timeout'
  | 'network'
  | 'unknown'

export interface ConnectionFailure {
  kind: ConnectionFailureKind
  /** Short, friendly sentence that is safe to show in the interface. */
  message: string
  /** Sanitised diagnostic text. Never shown by default and never includes the key. */
  technical?: string
}

const friendly: Record<ConnectionFailureKind, string> = {
  auth: 'Invalid API key. Double-check that you copied the entire key.',
  quota:
    "You've reached a usage limit. Check your Google AI Studio quota or switch to another available model.",
  model: 'Your current model is unavailable. Try another compatible model.',
  timeout: 'Connection timed out. Please try again.',
  network: "We couldn't reach Google. Check your internet connection and try again.",
  unknown: "We couldn't connect with that key. Check that you copied the entire key and try again.",
}

/**
 * Turn any provider/SDK/discovery failure into one of the friendly categories
 * used by AI Setup. Raw errors are classified, not displayed.
 */
export function classifyConnectionFailure(error: unknown): ConnectionFailure {
  const analysed = classifyError(error)
  const name = (error as { name?: string } | null)?.name
  const aborted = name === 'AbortError' || /abort/i.test(analysed.message)

  let kind: ConnectionFailureKind = 'unknown'
  if (analysed.authError) kind = 'auth'
  else if (analysed.code === 'timeout' || aborted) kind = 'timeout'
  else if (analysed.rateLimited || analysed.quotaExhausted || analysed.code === '429') kind = 'quota'
  else if (analysed.notFound || analysed.modelIncompatible || analysed.code === '404') kind = 'model'
  else if (analysed.code === 'network') kind = 'network'

  return {
    kind,
    message: friendly[kind],
    technical: redactSecrets(analysed.message) || undefined,
  }
}

export function connectionFailureMessage(kind: ConnectionFailureKind): string {
  return friendly[kind]
}
