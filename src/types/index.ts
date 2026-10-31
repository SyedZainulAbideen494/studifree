export type Theme = 'dark' | 'light' | 'system'

export type TeachingStyle =
  | 'beginner' | 'analogy' | 'step-by-step' | 'visual' | 'practical'
  | 'exam' | 'formula' | 'compare'

export interface Lesson {
  id: string
  title: string
  topic: string
  style: TeachingStyle
  content: string // markdown-ish
  source?: { type: 'pdf' | 'image' | 'topic' | 'deck'; name?: string }
  createdAt: number
  updatedAt: number
  tags: string[]
  folder?: string
}

export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  tags: string[]
  source?: string
  createdAt: number
  // spaced repetition
  ease: number
  interval: number // days
  repetitions: number
  due: number // timestamp
  lastReviewed?: number
  confidence: number // 0-5
  lapses: number
}

export interface Deck {
  id: string
  name: string
  description?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  folder?: string
}

export interface QuizQuestion {
  id: string
  type: 'mcq' | 'multi' | 'tf' | 'fill' | 'numerical' | 'formula' | 'scenario' | 'conceptual'
  question: string
  options?: string[]
  answer: string | string[] | number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  concept?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  createdAt: number
  source?: string
  mode?: 'practice' | 'exam' | 'timed' | 'untimed'
  timeLimitSec?: number
}

export interface QuizResult {
  id: string
  quizId: string
  score: number
  total: number
  timeSec: number
  answers: Record<string, any>
  weakConcepts: string[]
  createdAt: number
}

export interface ConceptMastery {
  concept: string
  accuracy: number // 0-1
  attempts: number
  correct: number
  lastSeen: number
  confidence: number // 0-1
  status: 'struggling' | 'developing' | 'understanding' | 'strong' | 'mastered'
  misconceptions: string[]
}

export interface StudySession {
  id: string
  startedAt: number
  endedAt?: number
  minutes: number
  topic?: string
}

export interface PlannerItem {
  id: string
  title: string
  due: number
  done: boolean
  type: 'review' | 'lesson' | 'quiz' | 'flashcard' | 'goal'
  createdAt: number
}

export interface DailyGoal {
  date: string // YYYY-MM-DD
  minutes: number
  target: number
}

export interface LibraryItem {
  id: string
  kind: 'pdf' | 'image' | 'lesson' | 'deck' | 'quiz' | 'explanation'
  name: string
  meta?: any
  createdAt: number
  tags: string[]
  folder?: string
}

export interface ProviderConfig {
  provider: 'gemini'
  apiKey: string
  model: string
  fallbackModel?: string
}

export interface AppSettings {
  theme: Theme
  effectsEnabled: boolean
  reducedMotion: boolean
  pomodoroWork: number
  pomodoroBreak: number
  pomodoroLongBreak: number
  onboardingDone: boolean
  ai?: ProviderConfig
  studyGoalMinutes: number
}

export interface SourceFileMeta {
  id: string
  name: string
  type: 'pdf' | 'image'
  size: number
  createdAt: number
  text?: string
}
