import Dexie, { type Table } from 'dexie'
import type {
  Lesson, Flashcard, Deck, Quiz, QuizResult, ConceptMastery,
  StudySession, PlannerItem, DailyGoal, LibraryItem, SourceFileMeta,
} from '../types'

export class StudifreeDB extends Dexie {
  lessons!: Table<Lesson, string>
  decks!: Table<Deck, string>
  cards!: Table<Flashcard, string>
  quizzes!: Table<Quiz, string>
  quizResults!: Table<QuizResult, string>
  concepts!: Table<ConceptMastery, string>
  sessions!: Table<StudySession, string>
  planner!: Table<PlannerItem, string>
  goals!: Table<DailyGoal, string>
  library!: Table<LibraryItem, string>
  files!: Table<SourceFileMeta, string>

  constructor() {
    super('studifree')
    this.version(1).stores({
      lessons: 'id, title, createdAt, updatedAt, folder',
      decks: 'id, name, createdAt, updatedAt, folder',
      cards: 'id, deckId, due, createdAt',
      quizzes: 'id, title, createdAt',
      quizResults: 'id, quizId, createdAt',
      concepts: 'concept, status, lastSeen',
      sessions: 'id, startedAt',
      planner: 'id, due, done, createdAt',
      goals: 'date',
      library: 'id, kind, name, createdAt, folder',
      files: 'id, name, createdAt',
    })
  }
}

export const db = new StudifreeDB()
