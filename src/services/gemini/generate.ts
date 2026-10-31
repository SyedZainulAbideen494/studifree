import { modelManager } from './modelManager'
import { extractJson } from '../../utils/json'

export interface GenCard {
  front: string
  back: string
  explanation?: string
  sourcePage?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  topic?: string
}

export interface GenParams {
  apiKey: string
  topic?: string
  instructions?: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
  count: number
  language?: string
  images?: { base64: string; mimeType: string }[]
  pdfText?: string
  model?: string
}

export async function generateCards(p: GenParams): Promise<GenCard[]> {
  if (!p.apiKey) throw new Error('API key missing')
  const prompt = [
    `You are an expert educator creating high-quality flashcards.`,
    p.topic ? `Topic: ${p.topic}` : '',
    p.instructions ? `Additional instructions: ${p.instructions}` : '',
    `Difficulty: ${p.difficulty ?? 'mixed'}`,
    `Number of cards: ${p.count}`,
    `Language: ${p.language ?? 'English'}`,
    p.pdfText ? `Source text (may be truncated):\n${p.pdfText.slice(0, 12000)}` : '',
    p.images?.length ? 'Also use the provided images as source material.' : '',
    `Rules:
- One learning objective per card.
- Avoid duplicate questions.
- Preserve technical terminology and math formulas.
- Concise front (question), clear back (answer).
- Add explanation when helpful.
- If source-derived, set sourcePage when possible.
- Return ONLY valid JSON { "cards": [ { "front", "back", "explanation", "sourcePage", "difficulty", "topic" } ] }`,
  ].filter(Boolean).join('\n\n')

  const parts: any[] = [{ text: prompt }]
  if (p.images) for (const img of p.images) parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } })

  const { text } = await modelManager.generate('flashcards', p.apiKey, {
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: 'application/json', temperature: 0.4 },
  })
  if (!text.trim()) throw new Error('Empty response')
  const parsed = extractJson(text)
  const cards = Array.isArray(parsed?.cards) ? parsed.cards : []
  const valid: GenCard[] = []
  for (const c of cards) {
    if (typeof c.front === 'string' && typeof c.back === 'string' && c.front.trim() && c.back.trim()) {
      valid.push({
        front: c.front.trim(),
        back: c.back.trim(),
        explanation: typeof c.explanation === 'string' ? c.explanation.trim() : undefined,
        sourcePage: typeof c.sourcePage === 'number' ? c.sourcePage : undefined,
        difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : undefined,
        topic: typeof c.topic === 'string' ? c.topic.trim() : undefined,
      })
    }
  }
  if (!valid.length) throw new Error('No valid cards generated')
  return valid.slice(0, p.count)
}

export async function testGemini(apiKey: string, model?: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new (GoogleGenAI as any)({ apiKey })
  const res = await ai.models.generateContent({ model: model || 'gemini-2.5-flash', contents: 'Reply with the single word: OK' })
  return (res.text ?? '').trim()
}
