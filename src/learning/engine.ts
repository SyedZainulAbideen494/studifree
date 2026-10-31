import { db } from '../db'
import type { ConceptMastery } from '../types'

function statusFrom(accuracy: number, attempts: number): ConceptMastery['status'] {
  if (attempts < 3) return 'developing'
  if (accuracy < 0.4) return 'struggling'
  if (accuracy < 0.6) return 'developing'
  if (accuracy < 0.8) return 'understanding'
  if (accuracy < 0.95) return 'strong'
  return 'mastered'
}

export async function recordAttempt(concept: string, correct: boolean, confidence = 0.5) {
  if (!concept) return
  const existing = await db.concepts.get(concept)
  const now = Date.now()
  if (!existing) {
    const c: ConceptMastery = {
      concept,
      accuracy: correct ? 1 : 0,
      attempts: 1,
      correct: correct ? 1 : 0,
      lastSeen: now,
      confidence,
      status: 'developing',
      misconceptions: [],
    }
    c.status = statusFrom(c.accuracy, c.attempts)
    await db.concepts.put(c)
    return c
  }
  const attempts = existing.attempts + 1
  const correctCount = existing.correct + (correct ? 1 : 0)
  const accuracy = correctCount / attempts
  const updated: ConceptMastery = {
    ...existing,
    attempts,
    correct: correctCount,
    accuracy,
    lastSeen: now,
    confidence: (existing.confidence + confidence) / 2,
    status: statusFrom(accuracy, attempts),
  }
  if (!correct && !existing.misconceptions.includes('recent error')) {
    // keep generic; callers can add specific misconceptions
  }
  await db.concepts.put(updated)
  return updated
}

export async function getConcept(concept: string) {
  return db.concepts.get(concept)
}

export async function getAllConcepts() {
  return db.concepts.toArray()
}

export async function getStrugglingConcepts() {
  const all = await db.concepts.toArray()
  return all.filter((c) => c.status === 'struggling' || c.status === 'developing').sort((a, b) => a.accuracy - b.accuracy)
}

export function remedialPath(concept: string): string[] {
  return [
    'Foundation',
    'Explanation',
    'Analogy',
    'Example',
    'Guided Practice',
    'Independent Recall',
    'Reassessment',
  ]
}

export async function shouldGenerateRemedial(concept: string): Promise<boolean> {
  const c = await db.concepts.get(concept)
  if (!c) return false
  // sufficient evidence: at least 5 attempts and struggling/developing with low accuracy
  return c.attempts >= 5 && c.accuracy < 0.5 && (c.status === 'struggling' || c.status === 'developing')
}

export async function addMisconception(concept: string, text: string) {
  const c = await db.concepts.get(concept)
  if (!c) return
  if (!c.misconceptions.includes(text)) c.misconceptions.push(text)
  await db.concepts.put(c)
}

export function explainRecommendation(concepts: ConceptMastery[]): string {
  if (!concepts.length) return 'No learning gaps detected yet. Keep practising.'
  const top = concepts[0]
  return `Focus on "${top.concept}" (${Math.round(top.accuracy * 100)}% accuracy). Suggested path: ${remedialPath(top.concept).join(' → ')}.`
}
