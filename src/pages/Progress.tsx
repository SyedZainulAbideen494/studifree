import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, Target, Brain, Layers, ClipboardCheck } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { db } from '../db'
import { getStrugglingConcepts, explainRecommendation } from '../learning/engine'
import type { ConceptMastery, QuizResult } from '../types'

export default function Progress() {
  const [sessions, setSessions] = useState<any[]>([])
  const [concepts, setConcepts] = useState<ConceptMastery[]>([])
  const [results, setResults] = useState<QuizResult[]>([])
  const [cardCount, setCardCount] = useState(0)
  const [dueCount, setDueCount] = useState(0)
  const [lessonCount, setLessonCount] = useState(0)
  const [rec, setRec] = useState<string>('')

  useEffect(() => {
    db.sessions.toArray().then(setSessions)
    db.concepts.toArray().then(setConcepts)
    db.quizResults.toArray().then(setResults)
    db.cards.count().then(setCardCount)
    db.cards.where('due').belowOrEqual(Date.now()).count().then(setDueCount)
    db.lessons.count().then(setLessonCount)
    getStrugglingConcepts().then((c) => setRec(explainRecommendation(c)))
  }, [])

  const totalMinutes = sessions.reduce((a, s) => a + (s.minutes || 0), 0)
  const avgQuiz = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length)
    : 0

  const masteryDist = ['struggling', 'developing', 'understanding', 'strong', 'mastered'].map((s) => ({
    name: s,
    value: concepts.filter((c) => c.status === s).length,
  }))

  const weak = concepts.filter((c) => c.status === 'struggling' || c.status === 'developing').sort((a, b) => a.accuracy - b.accuracy).slice(0, 6)

  const hasData = sessions.length || concepts.length || results.length || cardCount || lessonCount

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Progress</h1>

      {!hasData && <EmptyState title="No data yet" description="Start learning, take quizzes and review flashcards to see progress." />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-xs text-muted mb-1">Time studied</div><div className="text-xl font-semibold text-ink">{totalMinutes} min</div></Card>
        <Card><div className="text-xs text-muted mb-1">Lessons</div><div className="text-xl font-semibold text-ink">{lessonCount}</div></Card>
        <Card><div className="text-xs text-muted mb-1">Flashcards</div><div className="text-xl font-semibold text-ink">{cardCount}</div></Card>
        <Card><div className="text-xs text-muted mb-1">Due reviews</div><div className="text-xl font-semibold text-ink">{dueCount}</div></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><div className="text-xs text-muted mb-1">Quiz accuracy</div><div className="text-xl font-semibold text-ink">{avgQuiz}%</div></Card>
        <Card><div className="text-xs text-muted mb-1">Concepts tracked</div><div className="text-xl font-semibold text-ink">{concepts.length}</div></Card>
        <Card><div className="text-xs text-muted mb-1">Quizzes taken</div><div className="text-xl font-semibold text-ink">{results.length}</div></Card>
      </div>

      {concepts.length > 0 && (
        <Card>
          <h2 className="font-semibold text-ink mb-3">Mastery distribution</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryDist}>
                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={11} />
                <YAxis stroke="var(--color-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', color: 'var(--color-ink)' }} />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-ink mb-2">Recommended next step</h2>
        <p className="text-sm text-muted">{rec}</p>
      </Card>

      {weak.length > 0 && (
        <Card>
          <h2 className="font-semibold text-ink mb-3">Weak topics</h2>
          <ul className="space-y-2">
            {weak.map((c) => (
              <li key={c.concept} className="flex items-center justify-between p-2 rounded-xl bg-accent-soft">
                <span className="text-sm text-ink">{c.concept}</span>
                <span className="text-xs text-muted">{Math.round(c.accuracy * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
