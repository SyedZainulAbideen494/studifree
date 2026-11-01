import type { ModelMetadata, ModelCategory, ModelCapability, DiscoveryResult } from '../../types/ai'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

interface RawModel {
  name: string
  displayName?: string
  description?: string
  version?: string
  supportedGenerationMethods?: string[]
  inputTokenLimit?: number
  outputTokenLimit?: number
  temperature?: number
  maxTemperature?: number
  topP?: number
  topK?: number
}

function idOf(name: string) {
  return (name || '').replace(/^models\//, '')
}

export function detectCapabilities(id: string, description: string, methods: string[]): ModelCapability[] {
  const lower = (id + ' ' + description).toLowerCase()
  const caps = new Set<ModelCapability>()
  const has = (m: string) => methods.some((x) => x.toLowerCase() === m.toLowerCase())

  if (has('embedContent') || /embedding/.test(lower)) {
    caps.add('embedding')
  }
  if (/tts|text-to-speech/.test(lower)) caps.add('tts')
  if (has('generateContent') || has('streamGenerateContent')) {
    if (!/embedding/.test(lower)) caps.add('text')
    caps.add('multimodal')
    caps.add('structured-output')
  }
  if (/vision|multimodal|image understanding|see|photo/.test(lower) || has('generateContent')) {
    if (!/embedding|tts/.test(lower)) caps.add('vision')
  }
  if (/imagen|image generation|image-generation|nano banana|generate images|image editing/.test(lower)) {
    caps.add('image-generation')
  }
  if (/audio|speech|transcri|live/.test(lower)) caps.add('audio-transcription')
  if (/pro|reasoning|thinking|deep/.test(lower)) caps.add('reasoning')
  return [...caps]
}

export function categorise(id: string, description: string, caps: ModelCapability[]): ModelCategory {
  const lower = (id + ' ' + description).toLowerCase()
  if (caps.includes('embedding')) return 'embedding'
  if (caps.includes('tts') || caps.includes('audio-transcription')) return 'audio'
  if (caps.includes('image-generation')) return 'image'
  if (caps.includes('reasoning') || /pro/.test(lower)) return 'advanced-reasoning'
  if (/lite|nano/.test(lower)) return 'fast'
  if (/flash|general/.test(lower)) return 'general'
  return 'other'
}

export function mapModel(raw: RawModel): ModelMetadata {
  const id = idOf(raw.name)
  const description = raw.description ?? ''
  const methods = raw.supportedGenerationMethods ?? []
  const capabilities = detectCapabilities(id, description, methods)
  const deprecated = /deprecated|shutdown|shut down|retired/.test(description.toLowerCase())
  return {
    id,
    name: raw.name,
    displayName: raw.displayName || id,
    description,
    provider: 'gemini',
    category: categorise(id, description, capabilities),
    capabilities,
    inputTokenLimit: raw.inputTokenLimit,
    outputTokenLimit: raw.outputTokenLimit,
    supportedMethods: methods,
    version: raw.version,
    deprecated,
    availability: deprecated ? 'deprecated' : 'unknown',
    raw,
  }
}

export async function discoverGeminiModels(apiKey: string, signal?: AbortSignal): Promise<DiscoveryResult> {
  if (!apiKey.trim()) throw new Error('No API key configured.')
  const all: RawModel[] = []
  let pageToken: string | undefined
  let pages = 0
  do {
    const url = new URL(ENDPOINT)
    url.searchParams.set('pageSize', '100')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await fetch(url.toString(), {
      headers: { 'x-goog-api-key': apiKey },
      signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      const err: any = new Error(body || `Model discovery failed with status ${res.status}`)
      err.status = res.status
      throw err
    }
    const json = await res.json()
    if (Array.isArray(json.models)) all.push(...json.models)
    pageToken = json.nextPageToken
    pages++
    if (pages > 10) break // hard safety cap
  } while (pageToken)

  // Deduplicate and exclude clearly non-generative metadata records.
  const seen = new Set<string>()
  const models: ModelMetadata[] = []
  for (const raw of all) {
    const m = mapModel(raw)
    if (!m.id || seen.has(m.id)) continue
    seen.add(m.id)
    models.push(m)
  }
  return { models, refreshedAt: Date.now() }
}
