import type { AIRequest } from '../../types/ai'

export interface GenerateOutput {
  text: string
  raw?: any
  model: string
}

export interface ProviderAdapter {
  id: string
  generateText(apiKey: string, modelId: string, req: AIRequest, signal?: AbortSignal): Promise<GenerateOutput>
  testModel(apiKey: string, modelId: string, signal?: AbortSignal): Promise<{ ok: boolean; ms: number; text?: string; error?: string }>
  embed?(apiKey: string, modelId: string, text: string, signal?: AbortSignal): Promise<number[]>
  generateImage?(apiKey: string, modelId: string, prompt: string, signal?: AbortSignal): Promise<{ base64: string; mimeType: string }[]>
}

/** Gemini adapter backed by the official @google/genai SDK. */
export class GeminiAdapter implements ProviderAdapter {
  id = 'gemini'

  private async sdk(apiKey: string) {
    const { GoogleGenAI } = await import('@google/genai')
    return new GoogleGenAI({ apiKey })
  }

  async generateText(apiKey: string, modelId: string, req: AIRequest, signal?: AbortSignal): Promise<GenerateOutput> {
    const ai = await this.sdk(apiKey)
    const config: any = { ...(req.config ?? {}) }
    if (req.systemInstruction) config.systemInstruction = req.systemInstruction
    if (req.schema) config.responseSchema = req.schema
    const contents = req.contents

    const call = () => ai.models.generateContent({ model: modelId, contents, config })
    let res: any
    try {
      res = await call()
    } catch (e: any) {
      // Adapt config safely if the model rejects an unsupported setting.
      const msg = String(e?.message ?? e)
      if (/responseSchema|responseMimeType|temperature|unsupported|not supported/i.test(msg) && Object.keys(config).length) {
        const reduced = { ...config }
        delete reduced.responseSchema
        res = await ai.models.generateContent({ model: modelId, contents, config: reduced })
      } else {
        throw e
      }
    }
    const text = res.text ?? ''
    return { text, raw: res, model: modelId }
  }

  async testModel(apiKey: string, modelId: string, signal?: AbortSignal) {
    const t0 = Date.now()
    try {
      const ai = await this.sdk(apiKey)
      const res = await ai.models.generateContent({ model: modelId, contents: 'Reply with the single word: OK' })
      const text = (res.text ?? '').trim()
      return { ok: !!text, ms: Date.now() - t0, text }
    } catch (e: any) {
      return { ok: false, ms: Date.now() - t0, error: e?.message ?? String(e) }
    }
  }

  async embed(apiKey: string, modelId: string, text: string) {
    const ai = await this.sdk(apiKey)
    const res: any = await ai.models.embedContent({ model: modelId, contents: text })
    const values = res.embeddings?.[0]?.values ?? res.embedding?.values ?? []
    return values as number[]
  }

  async generateImage(apiKey: string, modelId: string, prompt: string) {
    const ai = await this.sdk(apiKey)
    const res: any = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseModalities: ['IMAGE'] },
    })
    const parts = res?.candidates?.[0]?.content?.parts ?? []
    const images: { base64: string; mimeType: string }[] = []
    for (const p of parts) {
      const inline = p.inlineData ?? p.inline_data
      if (inline?.data) images.push({ base64: inline.data, mimeType: inline.mimeType ?? inline.mime_type ?? 'image/png' })
    }
    return images
  }
}

const adapters: Record<string, ProviderAdapter> = {
  gemini: new GeminiAdapter(),
}

export function getAdapter(provider = 'gemini'): ProviderAdapter {
  return adapters[provider] ?? adapters.gemini
}

export function registerAdapter(adapter: ProviderAdapter) {
  adapters[adapter.id] = adapter
}
