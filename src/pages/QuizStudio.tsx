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
import {
  AIGenerationModal,
  GenerationErrorModal,
  GenerationStatusIndicator,
  GenerationSuccessModal,
  useDelayedVisibility,
  useGenerationMachine,
} from '../components/AI/generation'
import { useAppStore } from '../store/useAppStore'
import { useAiEventsStore } from '../store/useAiEventsStore'
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
  const [genError, setGenError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [pendingQuiz, setPendingQuiz] = useState<Quiz | null>(null)
  const [quizSuccess, setQuizSuccess] = useState<{
    quizId: string
    title: string
    count: number
    difficulty: string
    source: string
    mode: string
  } | null>(null)

  const generation = useGenerationMachine('quiz')
  const waitingVisible = useDelayedVisibility(generation.busy)
  const lastSwitch = useAiEventsStore((s) => s.switches[0])
  const fallbackNote =
    generation.startedAt && lastSwitch && lastSwitch.timestamp >= generation.startedAt
      ? `Studifree switched to ${lastSwitch.toModel} after your preferred model was unavailable.`
      : undefined

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

  const persistQuiz = async (candidate: Quiz): Promise<Quiz> => {
    await db.quizzes.put(candidate)
    const saved = await db.quizzes.get(candidate.id)
    if (!saved) throw new Error('The quiz could not be retrieved after saving.')
    if (!saved.questions.length) throw new Error('The saved quiz has no questions.')
    return saved
  }

  const celebrate = (saved: Quiz, sourceLabel: string) => {
    setPendingQuiz(null)
    setQuizSuccess({
      quizId: saved.id,
      title: saved.title,
      count: saved.questions.length,
      difficulty,
      source: sourceLabel,
      mode,
    })
    generation.succeed()
  }

  const generate = async () => {
    setGenError(null)
    setPendingQuiz(null)
    setQuizSuccess(null)

    const apiKey = settings.ai?.apiKey
    if (!apiKey) {
      setGenError('Add your Gemini API key in AI Setup to generate a quiz.')
      return
    }
    if (!topic.trim() && !sourceText.trim()) {
      setGenError('Enter a topic or source text.')
      return
    }
    if (!generation.begin('quiz')) return

    let pending: Quiz | null = null
    try {
      const raw = await generateQuiz(apiKey, {
        topic: topic.trim() || undefined,
        sourceText: sourceText.trim() || undefined,
        count,
        difficulty,
        types: ['mcq', 'tf', 'numeric', 'conceptual'],
      })

      generation.setStatus('validating')
      const questions: QuizQuestion[] = raw
        .filter((question: any) => typeof question?.question === 'string' && question.question.trim())
        .map((question: any, index: number) => ({
          id: uid('q') + index,
          type: (question.questionType === 'tf'
            ? 'tf'
            : question.questionType === 'numeric'
              ? 'numerical'
              : question.questionType === 'multi'
                ? 'multi'
                : 'mcq') as QuizQuestion['type'],
          question: question.question,
          options: question.options,
          answer: question.correctAnswer,
          explanation: question.explanation ?? '',
          difficulty:
            question.difficulty === 'easy' || question.difficulty === 'hard'
              ? question.difficulty
              : 'medium',
          concept: question.concept,
        }))

      if (!questions.length) {
        throw new Error('The model did not return any usable questions. Please try again.')
      }

      const candidate: Quiz = {
        id: uid('quiz'),
        title: topic.trim() || 'Generated quiz',
        questions,
        createdAt: Date.now(),
        source: topic.trim() || 'Source text',
        mode,
        timeLimitSec: mode === 'timed' ? timeLimit : undefined,
      }

      pending = candidate
      setPendingQuiz(candidate)
      generation.setStatus('saving')
      const saved = await persistQuiz(candidate)
      setQuiz(saved)
      setAnswers({})
      setSubmitted(false)
      setResult(null)
      setStartedAt(null)
      celebrate(saved, candidate.source ?? 'Topic')
    } catch (error: any) {
      const message = isNoApiKeyError(error)
        ? 'Add your Gemini API key in AI Setup to generate a quiz.'
        : error?.message ?? String(error)
      generation.fail(message)
    }
  }

  const retrySave = async () => {
    if (!pendingQuiz) return
    if (!generation.begin('quiz')) return
    generation.setStatus('saving')
    try {
      const saved = await persistQuiz(pendingQuiz)
      setQuiz(saved)
      setAnswers({})
      setSubmitted(false)
      setResult(null)
      setStartedAt(null)
      celebrate(saved, pendingQuiz.source ?? 'Topic')
    } catch (error: any) {
      generation.fail(error?.message ?? 'The quiz could not be saved. Please try again.')
    }
  }

  const startGeneratedQuiz = () => {
    setQuizSuccess(null)
    generation.reset()
    setStartedAt(Date.now())
  }

  const viewGeneratedQuiz = () => {
    if (!quizSuccess) return
    const id = quizSuccess.quizId
    setQuizSuccess(null)
    generation.reset()
    navigate(`/quiz?quiz=${encodeURIComponent(id)}`)
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

      {pendingQuiz && generation.status !== 'success' && (
        <div className="rounded-2xl border border-line-strong bg-surface p-4">
          <p className="text-sm font-medium text-ink">Your quiz is generated but not yet saved.</p>
          <p className="text-xs text-muted mt-1">
            The questions are still in this tab. Retry saving before leaving the page.
          </p>
          <Button size="sm" className="mt-3" onClick={retrySave}>
            Try saving again
          </Button>
        </div>
      )}

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
              <Button onClick={generate} disabled={generation.busy}>
                {generation.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{' '}
                {generation.busy ? 'Generating quiz…' : 'Generate quiz'}
              </Button>
              <GenerationStatusIndicator status={generation.status} taskType="quiz" />
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

      <AIGenerationModal
        open={waitingVisible}
        status={generation.status}
        taskType="quiz"
        fallbackNote={fallbackNote}
      />

      <GenerationSuccessModal
        open={generation.status === 'success' && !!quizSuccess}
        heading="Your quiz is ready!"
        message={
          quizSuccess
            ? `${quizSuccess.count} practice questions are saved and ready. Start now, or open the quiz to review it first.`
            : 'Your practice questions are saved and ready.'
        }
        kind="quiz"
        summary={
          quizSuccess
            ? [
                { label: 'Quiz', value: quizSuccess.title },
                { label: 'Questions', value: `${quizSuccess.count}` },
                { label: 'Difficulty', value: quizSuccess.difficulty },
                { label: 'Source', value: quizSuccess.source },
              ]
            : undefined
        }
        primary={{ label: 'Start quiz', onClick: startGeneratedQuiz }}
        secondary={{ label: 'View quiz', onClick: viewGeneratedQuiz }}
        tertiary={{
          label: 'Back to setup',
          onClick: () => {
            setQuizSuccess(null)
            generation.reset()
          },
        }}
        fallbackNote={fallbackNote}
        onClose={() => {
          setQuizSuccess(null)
          generation.reset()
        }}
      />

      <GenerationErrorModal
        open={generation.status === 'error'}
        title={
          pendingQuiz
            ? 'Your quiz is ready, but it could not be saved.'
            : 'That quiz request could not be completed.'
        }
        message={
          pendingQuiz
            ? 'Studifree could not confirm that the quiz was written to this browser. Your generated questions are still here.'
            : generation.error ?? 'Something went wrong while generating the quiz.'
        }
        savingFailed={!!pendingQuiz}
        retryLabel={pendingQuiz ? 'Try saving again' : 'Try generating again'}
        onRetry={pendingQuiz ? retrySave : generate}
        onClose={() => generation.reset()}
      />

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
