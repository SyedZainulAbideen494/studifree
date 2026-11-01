import { z } from 'zod'
import { extractJson } from '../../utils/json'
import { executeAI } from '../ai/requestManager'

export type ExplainMode = 'beginner' | 'analogy' | 'step-by-step' | 'visual' | 'practical' | 'exam' | 'formula' | 'compare'

export interface ExplainSection { heading: string; content: string; type?: string }
export interface ExplainResult {
  title: string
  definition: string
  sections: ExplainSection[]
  importantPoints: string[]
  commonMisconceptions: string[]
  memoryTrick: string
  knowledgeCheck?: { question: string; options: string[]; correctAnswer: string; explanation: string }
}

const Schema = z.object({
  title: z.string(),
  definition: z.string(),
  sections: z.array(z.object({ heading: z.string(), content: z.string(), type: z.string().optional() })).default([]),
  importantPoints: z.array(z.string()).default([]),
  commonMisconceptions: z.array(z.string()).default([]),
  memoryTrick: z.string().default(''),
  knowledgeCheck: z.object({ question: z.string(), options: z.array(z.string()), correctAnswer: z.string(), explanation: z.string() }).optional(),
})

const modeInstructions: Record<ExplainMode, string> = {
  beginner: 'Explain from absolute basics using simple language a beginner can follow.',
  analogy: 'Use a relatable real-world analogy and clearly state where it stops being accurate.',
  'step-by-step': 'Explain each stage in sequence, one idea at a time.',
  visual: 'Describe diagrams, mental pictures and spatial relationships.',
  practical: 'Show where the concept is used in real life or work.',
  exam: 'Explain at exam level with precision and key points.',
  formula: 'Explain formulas, symbols, units, assumptions and worked calculations.',
  compare: 'Compare two related concepts and explain differences.',
}

export async function explain(apiKey: string, params: {
  concept: string
  mode: ExplainMode
  source?: string
  previousExplanation?: string
  incorrectResponse?: string
  compareWith?: string
  followup?: string
  images?: { base64: string; mimeType: string }[]
}): Promise<ExplainResult> {
  const prompt = [
    `You are a patient, encouraging teacher. Mode: ${modeInstructions[params.mode]}`,
    `Concept: ${params.concept}`,
    params.source ? `Source material (may be truncated): ${params.source.slice(0, 8000)}` : '',
    params.previousExplanation ? `Previous explanation (do not repeat): ${params.previousExplanation.slice(0, 1500)}` : '',
    params.incorrectResponse ? `Learner's incorrect response: ${params.incorrectResponse}` : '',
    params.compareWith ? `Compare with: ${params.compareWith}` : '',
    params.followup ? `Learner follow-up question: ${params.followup}` : '',
    `Return ONLY valid JSON with this structure:
{
  "title": "...",
  "definition": "...",
  "sections": [ { "heading": "...", "content": "markdown text", "type": "paragraph|formula|example" } ],
  "importantPoints": ["..."],
  "commonMisconceptions": ["..."],
  "memoryTrick": "...",
  "knowledgeCheck": { "question": "...", "options": ["..."], "correctAnswer": "...", "explanation": "..." }
}
Use Markdown inside content (bold, lists, code, math with $...$). Structure: Simple Definition, Understand It From Zero, How It Works, Visual/Physical Explanation, Real-world Example, Technical Details, Formula and Variables, Common Misconceptions, Exam Points, Memory Trick, Quick Knowledge Check. Omit irrelevant sections. Explain simply, one idea at a time. Preserve source terminology. Do not claim certainty where unsure.`,
  ].filter(Boolean).join('\n\n')

  const parts: any[] = [{ text: prompt }]
  if (params.images) {
    for (const img of params.images) parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } })
  }

  const res = await executeAI(
    {
      id: `explain:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`,
      task: params.mode === 'exam' || params.mode === 'formula' ? 'explain' : 'explain',
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json', temperature: 0.4 },
      images: params.images,
      preferredModel: undefined,
    },
    apiKey,
    { validate: (text) => Schema.parse(extractJson(text)) },
  )
  return Schema.parse(extractJson(res.text)) as ExplainResult
}
