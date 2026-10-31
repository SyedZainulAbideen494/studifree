import { modelManager } from './modelManager'
import { extractJson } from '../../utils/json'

export async function generateQuiz(apiKey: string, params: {
  sourceText?: string
  topic?: string
  count: number
  difficulty: string
  language?: string
  types?: string[]
  sourceOnly?: boolean
}): Promise<any[]> {
  const prompt = `Generate ${params.count} high-quality quiz questions.
Each question object must use these exact fields: question, questionType (one of mcq,tf,numeric,conceptual,fill,scenario,formula,multi), options (array of strings for mcq/tf/multi), correctAnswer, explanation, hint, difficulty, sourceReference, concept.
${params.topic ? 'Topic: ' + params.topic : ''}
${params.sourceText ? 'Source material:\n' + params.sourceText.slice(0, 12000) : ''}
Difficulty: ${params.difficulty}
Language: ${params.language ?? 'English'}
Allowed types: ${(params.types ?? ['mcq', 'tf', 'numeric', 'conceptual']).join(', ')}
${params.sourceOnly ? 'Source-only mode: questions must be strictly supported by source material.' : 'May include verified external knowledge if useful.'}
Rules:
- Preserve technical terms, equations, units.
- MCQ single-select must have exactly one defensible correct answer.
- Provide explanation and optional hint.
- Include sourceReference/page when possible.
- Return JSON { questions: [...] }.
`
  const { text } = await modelManager.generate('quiz', apiKey, {
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.4 },
  })
  const parsed = extractJson(text)
  const raw = Array.isArray(parsed?.questions) ? parsed.questions : (Array.isArray(parsed) ? parsed : [])
  const normOpt = (o: any) => (typeof o === 'string' ? o : (o?.text ?? o?.label ?? o?.option ?? String(o)))
  const normalized = raw.map((q: any) => ({
    question: q.question ?? q.prompt ?? q.text ?? '',
    questionType: q.questionType ?? q.type ?? 'mcq',
    options: Array.isArray(q.options ?? q.choices ?? q.answers) ? (q.options ?? q.choices ?? q.answers).map(normOpt) : undefined,
    correctAnswer: q.correctAnswer ?? q.answer ?? q.correct ?? q.solution,
    explanation: q.explanation ?? q.rationale,
    hint: q.hint,
    difficulty: q.difficulty ?? params.difficulty,
    sourceReference: q.sourceReference ?? q.source ?? q.page,
    concept: q.concept ?? q.conceptId ?? q.topic,
  }))
  const valid = normalized.filter((q: any) => q.question && q.correctAnswer != null)
  if (!valid.length) throw new Error('No valid questions generated. Try again.')
  return valid
}
