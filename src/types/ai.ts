export type ModelCapability =
  | 'text' | 'reasoning' | 'vision' | 'image-generation' | 'audio-transcription'
  | 'tts' | 'embedding' | 'structured-output' | 'multimodal'

export type ModelAvailability = 'available' | 'working' | 'slow' | 'failed' | 'deprecated' | 'unknown'

export type ModelCategory =
  | 'advanced-reasoning' | 'general' | 'fast' | 'image' | 'audio' | 'embedding' | 'other'

export interface ModelMetadata {
  id: string
  name: string
  displayName: string
  description?: string
  provider: 'gemini'
  category: ModelCategory
  capabilities: ModelCapability[]
  inputTokenLimit?: number
  outputTokenLimit?: number
  supportedMethods: string[]
  status?: string
  version?: string
  deprecated?: boolean
  lastTestedAt?: number
  lastTestMs?: number
  availability: ModelAvailability
  raw?: any
}

export interface ModelHealth {
  modelId: string
  successCount: number
  failureCount: number
  avgMs: number
  lastSuccess?: number
  lastFailure?: number
  lastError?: string
}

export interface FallbackPolicy {
  task: AITask
  autoFailover: boolean
  preferredModel?: string
  chain: string[] // model ids in priority order
  disabled: string[]
}

export type AITask =
  | 'explain' | 'flashcards' | 'quiz' | 'numerical' | 'pdf' | 'image-understand'
  | 'image-generate' | 'transcription' | 'tts' | 'embedding' | 'remedial' | 'adaptive'

export interface AIRequest {
  id: string
  task: AITask
  contents: any
  config?: any
  systemInstruction?: string
  schema?: any
  preferredModel?: string
  images?: { base64: string; mimeType: string }[]
}

export interface AIResponse {
  text: string
  model: string
  durationMs: number
  fallbackUsed: boolean
  originalModel?: string
}

export type AIErrorCode =
  | '503' | '429' | '500' | '502' | '504' | '408' | '404' | '400' | '401' | '403' | 'network' | 'timeout' | 'schema' | 'unknown'

export interface AIError {
  code: AIErrorCode
  httpStatus?: number
  message: string
  retryable: boolean
  authError: boolean
  notFound: boolean
  rateLimited: boolean
  quotaExhausted: boolean
  modelIncompatible: boolean
  raw?: any
}

export interface ModelSwitchEvent {
  timestamp: number
  requestId: string
  task: AITask
  fromModel: string
  toModel: string
  reason: string
  errorCode?: AIErrorCode
  success: boolean
}

export interface DiscoveryResult {
  models: ModelMetadata[]
  refreshedAt: number
  error?: string
}
