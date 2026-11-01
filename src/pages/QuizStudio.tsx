import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles, ClipboardCheck, Check, X, Clock } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Textarea } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { Progress } from '../components/UI/Progress'
import { Dialog } from '../components/UI/Dialog'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'
import { recordAttempt } from '../learning/engine'
import { uid } from '../utils/id'
import { generateQuiz } from '../services/gemini/quiz'
import { AiRequired } from '../components/AI/NoApiKeyPrompt'
import { isNoApiKeyError } from '../services/ai/requestManager'
import type { Quiz, QuizQuestion, QuizResult } from '../types'

const counts = [5, 10, 15, 20, 30, 50]

export default function QuizStudio() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [topic, setTopic] = useState(params.get('topic') ?? '')
  const [sourceText, setSourceText] = useState('')
  const [count, setCount] = useState(10)
  const [difficulty, setDifficulty] = useState('mixed')
  const [mode, setMode] = useState<'practice' | 'exam' | 'timed' | 'untimed'>('practice')
  const [timeLimit, setTimeLimit] = useState(600)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  // load existing quiz
  useEffect(() => {
    const qid = params.get('quiz')
    if (qid) {
      db.quizzes.get(qid).then((q) => { if (q) setQuiz(q) })
    }
  }, [params])

  useEffect(() => {
    if (!startedAt || submitted || mode !== 'timed') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [startedAt, submitted, mode])

  const generate = async () => {
    const apiKey = settings.ai?.apiKey
    if (!apiKey) { setGenError('Add your Gemini API key in AI Setup to generate a quiz.'); return }
    if (!topic.trim() && !sourceText.trim()) { setGenError('Enter a topic or source text.'); return }
    setGenLoading(true); setGenError(null)
    try {
      const raw = await generateQuiz(apiKey, {
        topic: topic.trim() || undefined,
        sourceText: sourceText.trim() || undefined,
        count,
        difficulty,
        types: ['mcq', 'tf', 'numeric', 'conceptual'],
      })
      const questions: QuizQuestion[] = raw.map((q: any, i: number) => ({
        id: uid('q') + i,
        type: (q.questionType === 'tf' ? 'tf' : q.questionType === 'numeric' ? 'numerical' : q.questionType === 'multi' ? 'multi' : 'mcq') as any,
        question: q.question,
        options: q.options,
        answer: q.correctAnswer,
        explanation: q.explanation ?? '',
        difficulty: (q.difficulty === 'easy' || q.difficulty === 'hard') ? q.difficulty : 'medium',
        concept: q.concept,
      }))
      const qz: Quiz = { id: uid('quiz'), title: topic || 'Quiz', questions, createdAt: Date.now(), mode, timeLimitSec: mode === 'timed' ? timeLimit : undefined }
      await db.quizzes.add(qz)
      setQuiz(qz)
      setAnswers({})
      setSubmitted(false)
      setResult(null)
      setStartedAt(Date.now())
    } catch (e: any) {
      setGenError(isNoApiKeyError(e) ? 'Add your Gemini API key in AI Setup to generate a quiz.' : e?.message ?? String(e))
    } finally {
      setGenLoading(false)
    }
  }

  const submit = async () => {
    if (!quiz) return
    setSubmitted(true)
    let score = 0
    const weak: string[] = []
    quiz.questions.forEach((q) => {
      const a = answers[q.id]
      const correct = Array.isArray(q.answer)
        ? Array.isArray(a) && q.answer.every((x: any) => a.includes(x)) && a.length === q.answer.length
        : String(a).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      if (correct) score++
      else if (q.concept) weak.push(q.concept)
      if (q.concept) recordAttempt(q.concept, correct)
    })
    const r: QuizResult = {
      id: uid('result'), quizId: quiz.id, score, total: quiz.questions.length,
      timeSec: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
      answers, weakConcepts: [...new Set(weak)], createdAt: Date.now(),
    }
    await db.quizResults.add(r)
    setResult(r)
  }

  const timeLeft = startedAt && mode === 'timed' ? Math.max(0, timeLimit - Math.round((now - startedAt) / 1000)) : null
  useEffect(() => {
    if (timeLeft === 0 && !submitted) submit()
  }, [timeLeft])

  const isExam = mode === 'exam' || mode === 'timed'

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Quiz Studio</h1>
        <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}><ClipboardCheck className="w-4 h-4" /> Help</Button>
      </div>

      {!quiz && (
        <AiRequired feature="AI quiz generation">
          <Card>
            <div className="space-y-3">
              <Input label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic for quiz" />
              <Textarea label="Source text (optional)" value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste text to base questions on" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Questions</label>
                  <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink">
                    {counts.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink">
                    {['easy', 'medium', 'hard', 'mixed'].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Mode</label>
                <div className="flex flex-wrap gap-2">
                  {(['practice', 'exam', 'timed', 'untimed'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-xl text-sm border ${mode === m ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-muted border-line'}`}>{m}</button>
                  ))}
                </div>
              </div>
              {mode === 'timed' && (
                <Input label="Time limit (seconds)" type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
              )}
              <Button onClick={generate} disabled={genLoading}>
                {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate quiz
              </Button>
              {genError && <p className="text-sm text-ink">{genError}</p>}
            </div>
          </Card>
        </AiRequired>
      )}

      {quiz && !submitted && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-ink">{quiz.title}</h2>
              {timeLeft != null && (
                <span className="text-sm text-muted flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
            <Progress value={Object.keys(answers).length} max={quiz.questions.length} label="Answered" />
          </Card>

          {quiz.questions.map((q, idx) => (
            <Card key={q.id}>
              <p className="text-sm text-muted mb-1">Q{idx + 1} · {q.difficulty}</p>
              <p className="font-medium text-ink mb-3">{q.question}</p>
              {q.type === 'mcq' || q.type === 'tf' ? (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl border transition ${answers[q.id] === opt ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-ink border-line hover:bg-elevated'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.type === 'multi' ? (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt, i) => {
                    const arr = (answers[q.id] ?? []) as string[]
                    const checked = arr.includes(opt)
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const next = checked ? arr.filter((x) => x !== opt) : [...arr, opt]
                          setAnswers({ ...answers, [q.id]: next })
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl border transition ${checked ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-ink border-line hover:bg-elevated'}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <Input
                  placeholder="Your answer"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              )}
            </Card>
          ))}

          <div className="flex gap-2">
            <Button onClick={submit} className="flex-1">Submit</Button>
            <Button variant="secondary" onClick={() => { setQuiz(null); setSubmitted(false) }}>Cancel</Button>
          </div>
        </div>
      )}

      {submitted && result && quiz && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-ink mb-2">Results</h2>
            <p className="text-muted">Score: {result.score} / {result.total} ({Math.round((result.score / result.total) * 100)}%)</p>
            <p className="text-muted">Time: {result.timeSec}s</p>
            {result.weakConcepts.length > 0 && <p className="text-muted mt-1">Weak concepts: {result.weakConcepts.join(', ')}</p>}
          </Card>

          {quiz.questions.map((q, idx) => {
            const a = answers[q.id]
            const correct = Array.isArray(q.answer)
              ? Array.isArray(a) && q.answer.every((x: any) => a.includes(x)) && a.length === q.answer.length
              : String(a).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
            return (
              <Card key={q.id}>
                <div className="flex items-start gap-2 mb-2">
                  {correct ? <Check className="w-5 h-5 text-ink mt-0.5" /> : <X className="w-5 h-5 text-ink mt-0.5" />}
                  <p className="font-medium text-ink">Q{idx + 1}. {q.question}</p>
                </div>
                <p className="text-sm text-muted">Your answer: {Array.isArray(a) ? a.join(', ') : (a ?? '—')}</p>
                <p className="text-sm text-ink">Correct: {Array.isArray(q.answer) ? q.answer.join(', ') : String(q.answer)}</p>
                {q.explanation && <p className="text-sm text-muted mt-2">{q.explanation}</p>}
              </Card>
            )
          })}

          <div className="flex gap-2">
            <Button onClick={() => { setQuiz(null); setSubmitted(false); setResult(null) }}>New quiz</Button>
            <Button variant="secondary" onClick={() => navigate('/progress')}>View progress</Button>
          </div>
        </div>
      )}

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Quiz Studio help">
        <div className="space-y-2 text-sm text-muted">
          <p><strong className="text-ink">What it does:</strong> Generates quizzes from topics or text.</p>
          <p><strong className="text-ink">Modes:</strong> Practice shows explanations after; Exam hides answers until submit; Timed adds a clock.</p>
          <p><strong className="text-ink">If it fails:</strong> Check API key and try fewer questions.</p>
        </div>
      </Dialog>
    </div>
  )
}
