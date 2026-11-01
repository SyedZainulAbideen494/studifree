import type { ModelMetadata, ModelHealth, DiscoveryResult } from '../../types/ai'
import { discoverGeminiModels } from './modelDiscovery'

const CACHE_KEY = 'studifree:ai:model-registry'
const HEALTH_KEY = 'studifree:ai:model-health'
const CACHE_TTL = 24 * 60 * 60 * 1000

interface CachePayload {
  refreshedAt: number
  models: ModelMetadata[]
}

type Listener = () => void

class ModelRegistry {
  private models: ModelMetadata[] = []
  private health: Record<string, ModelHealth> = {}
  private lastRefresh = 0
  private lastError: string | null = null
  private listeners = new Set<Listener>()

  constructor() {
    this.loadCache()
    this.loadHealth()
  }

  private loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return
      const payload: CachePayload = JSON.parse(raw)
      if (Array.isArray(payload.models)) {
        this.models = payload.models
        this.lastRefresh = payload.refreshedAt || 0
      }
    } catch { /* ignore corrupt cache */ }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ refreshedAt: this.lastRefresh, models: this.models }))
    } catch { /* storage may be full */ }
  }

  private loadHealth() {
    try {
      const raw = localStorage.getItem(HEALTH_KEY)
      if (raw) this.health = JSON.parse(raw)
    } catch { /* ignore */ }
  }

  private saveHealth() {
    try { localStorage.setItem(HEALTH_KEY, JSON.stringify(this.health)) } catch { /* ignore */ }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private emit() { this.listeners.forEach((l) => l()) }

  getModels(): ModelMetadata[] { return this.models }
  getLastRefresh(): number { return this.lastRefresh }
  getLastError(): string | null { return this.lastError }
  getHealth(): Record<string, ModelHealth> { return this.health }

  isStale(): boolean {
    return !this.lastRefresh || Date.now() - this.lastRefresh > CACHE_TTL
  }

  async refresh(apiKey: string, force = false): Promise<DiscoveryResult> {
    if (!force && !this.isStale() && this.models.length) {
      return { models: this.models, refreshedAt: this.lastRefresh }
    }
    this.lastError = null
    try {
      const result = await discoverGeminiModels(apiKey)
      this.models = result.models
      this.lastRefresh = result.refreshedAt
      this.saveCache()
      this.emit()
      return result
    } catch (e: any) {
      this.lastError = e?.message ?? String(e)
      this.emit()
      throw e
    }
  }

  /** Refresh silently; used after a 404 without blocking the main flow. */
  async refreshQuietly(apiKey: string) {
    try { await this.refresh(apiKey, true) } catch { /* keep old cache */ }
  }

  getModel(id: string): ModelMetadata | undefined {
    return this.models.find((m) => m.id === id)
  }

  getTextModels(): ModelMetadata[] {
    return this.models.filter((m) => !m.deprecated && m.capabilities.includes('text'))
  }

  getModelsForCapability(cap: string): ModelMetadata[] {
    return this.models.filter((m) => !m.deprecated && m.capabilities.includes(cap as any))
  }

  recordSuccess(id: string, ms: number) {
    const h = this.health[id] ?? { modelId: id, successCount: 0, failureCount: 0, avgMs: 0 }
    h.successCount++
    h.avgMs = h.avgMs ? Math.round((h.avgMs * (h.successCount - 1) + ms) / h.successCount) : ms
    h.lastSuccess = Date.now()
    this.health[id] = h
    this.saveHealth()
    const m = this.getModel(id)
    if (m) { m.availability = ms > 8000 ? 'slow' : 'working'; m.lastTestMs = ms; m.lastTestedAt = Date.now() }
    this.emit()
  }

  recordFailure(id: string, message: string) {
    const h = this.health[id] ?? { modelId: id, successCount: 0, failureCount: 0, avgMs: 0 }
    h.failureCount++
    h.lastFailure = Date.now()
    h.lastError = message
    this.health[id] = h
    this.saveHealth()
    const m = this.getModel(id)
    if (m) m.availability = 'failed'
    this.emit()
  }

  clearCache() {
    this.models = []
    this.lastRefresh = 0
    this.lastError = null
    try { localStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
    this.emit()
  }

  /** Stable, user-facing sort for model lists. */
  sortedForTask(cap: 'text' | 'vision' | 'image-generation' | 'audio-transcription' | 'tts' | 'embedding'): ModelMetadata[] {
    const list = this.models.filter((m) => !m.deprecated && m.capabilities.includes(cap))
    const score = (m: ModelMetadata) => {
      let s = 0
      if (m.category === 'advanced-reasoning') s += 30
      if (m.category === 'general') s += 20
      if (m.category === 'fast') s += 10
      if (/flash/.test(m.id)) s += 5
      if (/lite/.test(m.id)) s += 3
      const h = this.health[m.id]
      if (h) s += Math.min(5, h.successCount) - Math.min(5, h.failureCount)
      return s
    }
    return [...list].sort((a, b) => score(b) - score(a))
  }
}

export const modelRegistry = new ModelRegistry()
