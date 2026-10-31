export interface GeminiModelInfo {
  name: string
  id: string
  displayName?: string
  description?: string
  inputTokenLimit?: number
  outputTokenLimit?: number
  supportedGenerationMethods?: string[]
  status?: 'available' | 'working' | 'slow' | 'failed'
  lastTestMs?: number
  lastTestAt?: number
}
export interface ModelPrefs { primary: string; fallbacks: string[]; autoFailover: boolean }
export type FeatureModelPrefs = Record<string, ModelPrefs>
export interface ModelActivity {
  id: string
  timestamp: number
  feature: string
  primary: string
  used: string
  fallback: boolean
  retries: number
  durationMs: number
  success: boolean
  error?: string
}
