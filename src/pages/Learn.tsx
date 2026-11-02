import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Loader2, Sparkles, BookOpen, Layers, ClipboardCheck, Save, Download, HelpCircle, Globe2 } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Textarea } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { Tabs } from '../components/UI/Tabs'
import { Dialog } from '../components/UI/Dialog'
import { EmptyState } from '../components/UI/EmptyState'
import { Switch } from '../components/UI/Switch'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'
import { uid } from '../utils/id'
import { extractPdf, pagesToText } from '../utils/pdf'
import { explain, ExplainMode, ExplainResult } from '../services/gemini/explain'
import { exportLessonPdf } from '../utils/exportPdf'
import { AiRequired } from '../components/AI/NoApiKeyPrompt'
import {
  AIGenerationModal,
  GenerationErrorModal,
  GenerationStatusIndicator,
  GenerationSuccessModal,
  useDelayedVisibility,
  useGenerationMachine,
} from '../components/AI/generation'
import { useAiEventsStore } from '../store/useAiEventsStore'
import { useAiAvailability } from '../hooks/useAiAvailability'
import { useRegionalProfile } from '../hooks/useRegionalProfile'
import { describeRegion } from '../services/location'
import { isNoApiKeyError } from '../services/ai/requestManager'
import type { Lesson, TeachingStyle } from '../types'

const styles: { id: TeachingStyle; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'analogy', label: 'Analogy' },
  { id: 'step-by-step', label: 'Step-by-step' },
  { id: 'visual', label: 'Visual' },
  { id: 'practical', label: 'Practical' },
  { id: 'exam', label: 'Exam prep' },
  { id: 'formula', label: 'Formula' },
  { id: 'compare', label: 'Compare' },
]

export default function Learn() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [topic, setTopic] = useState(params.get('topic') ?? '')
  const [style, setStyle] = useState<TeachingStyle>((params.get('style') as TeachingStyle) || 'beginner')
  const [compareWith, setCompareWith] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [images, setImages] = useState<{ base64: string; mimeType: string }[]>([])
  const [result, setResult] = useState<ExplainResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(params.get('lesson'))
  const [helpOpen, setHelpOpen] = useState(false)
  const [previous, setPrevious] = useState<string | null>(null)
  const [useRegionalContext, setUseRegionalContext] = useState(false)
  const [pendingLesson, setPendingLesson] = useState<Lesson | null>(null)
  const [lessonSuccess, setLessonSuccess] = useState<{
    lessonId: string
    title: string
    topic: string
    style: string
  } | null>(null)
  const [pendingDocument, setPendingDocument] = useState<File | null>(null)
  const [documentSuccess, setDocumentSuccess] = useState<{
    name: string
    pages: number
    characters: number
  } | null>(null)

  const generation = useGenerationMachine('lesson')
  const waitingVisible = useDelayedVisibility(generation.busy)
  const lastSwitch = useAiEventsStore((s) => s.switches[0])
  const fallbackNote =
    generation.startedAt && lastSwitch && lastSwitch.timestamp >= generation.startedAt
      ? `Studifree switched to ${lastSwitch.toModel} after your preferred model was unavailable.`
      : undefined

  const ai = useAiAvailability()
  const region = useRegionalProfile()

  useEffect(() => {
    const lessonId = params.get('lesson')
    if (lessonId) {
      db.lessons.get(lessonId).then((l) => {
        if (l) {
          setTopic(l.topic)
          setStyle(l.style as TeachingStyle)
          try { setResult(JSON.parse(l.content)) } catch { /* content may be markdown */ }
        }
      })
    }
  }, [params])

  const runExplain = async (followup?: string) => {
    setError(null)
    if (!topic.trim()) {
      setError('Enter a topic first.')
      return
    }
    const apiKey = settings.ai?.apiKey
    if (!apiKey) {
      setError('Add your Gemini API key in AI Setup to use AI teaching.')
      return
    }
    if (!generation.begin('lesson')) return

    try {
      const response = await explain(apiKey, {
        concept: topic.trim() || 'the uploaded material',
        mode: style as any,
        source: sourceText || undefined,
        images: images.length ? images : undefined,
        compareWith: style === 'compare' ? compareWith : undefined,
        followup,
        previousExplanation: previous ?? undefined,
        region: useRegionalContext && region ? { country: region.country, region: region.region } : undefined,
      })
      setResult(response)
      setPrevious(response.definition)
      setPendingLesson(null)
      generation.reset()
    } catch (e: any) {
      const message = isNoApiKeyError(e)
        ? 'Add your Gemini API key in AI Setup to use AI teaching.'
        : e?.message ?? String(e)
      generation.fail(message)
    }
  }

  const explainSimpler = () => runExplain('Explain simpler, using smaller steps and simpler words.')
  const anotherExample = () => runExplain('Give another worked example, different from before.')
  const showSteps = () => runExplain('Show the full step-by-step solution.')
  const testUnderstanding = () => {
    if (!result?.knowledgeCheck) { runExplain('Ask one question to test my understanding.'); return }
    // open a quick quiz dialog? just show knowledge check inline
  }

  const persistLesson = async (lesson: Lesson): Promise<Lesson> => {
    const existing = await db.lessons.get(lesson.id)
    if (existing) lesson.createdAt = existing.createdAt
    await db.lessons.put(lesson)

    const saved = await db.lessons.get(lesson.id)
    if (!saved) throw new Error('The lesson could not be retrieved after saving.')
    if (!saved.content?.trim()) throw new Error('The saved lesson content could not be verified.')
    return saved
  }

  const saveLesson = async () => {
    if (!result) return
    setError(null)
    if (!generation.begin('lesson')) return

    const now = Date.now()
    const lesson: Lesson = {
      id: currentLessonId ?? uid('lesson'),
      title: result.title || topic,
      topic,
      style,
      content: JSON.stringify(result),
      source: { type: 'topic' },
      createdAt: now,
      updatedAt: now,
      tags: [],
    }

    try {
      setPendingLesson(lesson)
      generation.setStatus('saving')
      const saved = await persistLesson(lesson)
      setCurrentLessonId(saved.id)
      setPendingLesson(null)
      setLessonSuccess({
        lessonId: saved.id,
        title: saved.title,
        topic: saved.topic,
        style: saved.style,
      })
      generation.succeed()
    } catch (e: any) {
      generation.fail(e?.message ?? 'The lesson could not be saved. Please try again.')
    }
  }

  const retrySaveLesson = async () => {
    if (!pendingLesson) return
    if (!generation.begin('lesson')) return
    generation.setStatus('saving')
    try {
      const saved = await persistLesson(pendingLesson)
      setCurrentLessonId(saved.id)
      setPendingLesson(null)
      setLessonSuccess({
        lessonId: saved.id,
        title: saved.title,
        topic: saved.topic,
        style: saved.style,
      })
      generation.succeed()
    } catch (e: any) {
      generation.fail(e?.message ?? 'The lesson could not be saved. Please try again.')
    }
  }

  const closeLessonSuccess = () => {
    setLessonSuccess(null)
    generation.reset()
  }

  const startSavedLesson = () => {
    if (!lessonSuccess) return
    const id = lessonSuccess.lessonId
    setLessonSuccess(null)
    generation.reset()
    navigate(`/learn?lesson=${encodeURIComponent(id)}`)
  }

  const processDocument = async (file: File) => {
    setError(null)
    if (!generation.begin('document')) return
    setPendingDocument(file)

    try {
      const { pages } = await extractPdf(file)
      generation.setStatus('validating')
      const text = pagesToText(pages)
      if (!text.trim()) {
        throw new Error('No readable text was found in this document. It may be a scanned PDF.')
      }
      setSourceText(text)
      setPendingDocument(null)
      setDocumentSuccess({ name: file.name, pages: pages.length, characters: text.length })
      generation.succeed()
    } catch (e: any) {
      generation.fail(e?.message ?? 'The document could not be read.')
    }
  }

  const retryDocument = async () => {
    if (!pendingDocument) return
    await processDocument(pendingDocument)
  }

  const closeDocumentSuccess = () => {
    setDocumentSuccess(null)
    generation.reset()
  }

  const useDocumentForLesson = () => {
    setDocumentSuccess(null)
    generation.reset()
    if (topic.trim()) runExplain()
  }

  const retryGeneration = () => {
    if (pendingLesson) return retrySaveLesson()
    if (pendingDocument) return retryDocument()
    return runExplain()
  }

  const exportPdf = () => {
    if (result) exportLessonPdf(result, topic)
  }

  const generateFlashcards = () => {
    navigate(`/flashcards?topic=${encodeURIComponent(topic)}&from=learn`)
  }
  const generateQuiz = () => {
    navigate(`/quiz?topic=${encodeURIComponent(topic)}&from=learn`)
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Learn</h1>
        <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}><HelpCircle className="w-4 h-4" /> Help</Button>
      </div>

      <AiRequired feature="AI teaching explanations">
      <Card>
        <Input label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to learn?" />
        <div className="mt-3">
          <label className="block text-sm text-muted mb-1.5">Source material (optional)</label>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-line text-sm text-muted cursor-pointer hover:text-ink">
              <input type="file" accept="application/pdf" className="hidden" onChange={async (e) => {
                const input = e.currentTarget
                const f = input.files?.[0]; if (!f) return
                await processDocument(f)
                input.value = ''
              }} />
              Upload PDF
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-line text-sm text-muted cursor-pointer hover:text-ink">
              <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                const files = Array.from(e.target.files ?? [])
                const imgs: { base64: string; mimeType: string }[] = []
                for (const f of files) {
                  const b64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f) })
                  imgs.push({ base64: b64, mimeType: f.type })
                }
                setImages((prev) => [...prev, ...imgs])
              }} />
              Upload image(s)
            </label>
            {generation.busy && generation.taskType === 'document' && (
              <span className="text-xs text-muted self-center">Reading document…</span>
            )}
          </div>
          {sourceText && <p className="text-xs text-faint mt-2">PDF text loaded ({sourceText.length} chars).</p>}
          {images.length > 0 && <p className="text-xs text-faint mt-2">{images.length} image(s) attached.</p>}
          <Textarea className="mt-2" placeholder="Or paste source text here..." value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
        </div>
        <div className="mt-3">
          <label className="block text-sm text-muted mb-1.5">Teaching style</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition ${style === s.id ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-muted border-line hover:text-ink'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {style === 'compare' && (
          <div className="mt-3">
            <Input label="Compare with" value={compareWith} onChange={(e) => setCompareWith(e.target.value)} placeholder="Another concept" />
          </div>
        )}

        {region && (
          <div className="mt-4 rounded-2xl border border-line bg-inset p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <Globe2 className="w-4 h-4 text-ink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm text-ink">Use regional context</p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    When it is relevant, the teacher may use local examples or curriculum context for{' '}
                    {describeRegion(region)}. Only your country and region are shared, never precise
                    coordinates.
                  </p>
                </div>
              </div>
              <Switch
                checked={useRegionalContext}
                onChange={setUseRegionalContext}
                ariaLabel="Use regional context in AI explanations"
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => runExplain()} disabled={generation.busy}>
            {generation.busy && generation.taskType === 'lesson' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}{' '}
            Explain
          </Button>
          <Button variant="secondary" onClick={explainSimpler} disabled={generation.busy || !result}>Explain simpler</Button>
          <Button variant="secondary" onClick={anotherExample} disabled={generation.busy || !result}>Another example</Button>
          <Button variant="secondary" onClick={showSteps} disabled={generation.busy || !result}>Show steps</Button>
        </div>
        <GenerationStatusIndicator status={generation.status} taskType={generation.taskType} />
        {error && <p className="text-sm text-ink mt-3">{error}</p>}
      </Card>
      </AiRequired>

      {result && !generation.busy && (
        <Card>
          <h2 className="text-xl font-semibold text-ink mb-2">{result.title}</h2>
          <p className="text-ink leading-relaxed mb-4">{result.definition}</p>
          {result.sections.map((s, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold text-ink mb-1">{s.heading}</h3>
              <div className="prose-learn">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {s.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {result.importantPoints?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-ink mb-1">Important points</h3>
              <ul className="list-disc pl-5 text-ink space-y-1">{result.importantPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {result.commonMisconceptions?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-ink mb-1">Common misconceptions</h3>
              <ul className="list-disc pl-5 text-ink space-y-1">{result.commonMisconceptions.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {result.memoryTrick && (
            <div className="mb-4 p-3 rounded-2xl bg-accent-soft">
              <span className="font-semibold text-ink">Memory trick: </span>
              <span className="text-ink">{result.memoryTrick}</span>
            </div>
          )}
          {result.knowledgeCheck && (
            <div className="mb-4 p-4 rounded-2xl border border-line">
              <h3 className="font-semibold text-ink mb-2">Knowledge check</h3>
              <p className="text-ink mb-2">{result.knowledgeCheck.question}</p>
              <ul className="space-y-1">
                {result.knowledgeCheck.options.map((o, i) => (
                  <li key={i} className="text-sm text-muted">{o}</li>
                ))}
              </ul>
              <p className="text-xs text-faint mt-2">Answer: {result.knowledgeCheck.correctAnswer}</p>
              <p className="text-xs text-muted mt-1">{result.knowledgeCheck.explanation}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
            <Button variant="secondary" onClick={testUnderstanding}><BookOpen className="w-4 h-4" /> Test my understanding</Button>
            <Button variant="secondary" onClick={generateFlashcards}><Layers className="w-4 h-4" /> Generate flashcards</Button>
            <Button variant="secondary" onClick={generateQuiz}><ClipboardCheck className="w-4 h-4" /> Generate quiz</Button>
            <Button variant="secondary" onClick={saveLesson}><Save className="w-4 h-4" /> Save lesson</Button>
            <Button variant="secondary" onClick={exportPdf}><Download className="w-4 h-4" /> Export PDF</Button>
          </div>
        </Card>
      )}

      {!result && !generation.busy && !ai.requiresSetup && (
        <EmptyState icon={Sparkles} title="Ready to learn" description="Enter a topic and choose a style, then press Explain." />
      )}

      <AIGenerationModal
        open={waitingVisible}
        status={generation.status}
        taskType={generation.taskType}
        fallbackNote={fallbackNote}
      />

      <GenerationSuccessModal
        open={generation.status === 'success' && !!lessonSuccess}
        heading="Your lesson is ready!"
        message={
          lessonSuccess
            ? `“${lessonSuccess.title}” is saved in this browser and ready to reopen whenever you need it.`
            : 'Your lesson is saved and ready.'
        }
        kind="lesson"
        summary={
          lessonSuccess
            ? [
                { label: 'Lesson', value: lessonSuccess.title },
                { label: 'Topic', value: lessonSuccess.topic },
                { label: 'Style', value: lessonSuccess.style },
              ]
            : undefined
        }
        primary={{ label: 'Start learning', onClick: startSavedLesson }}
        secondary={{ label: 'View in Library', onClick: () => navigate('/library') }}
        tertiary={{ label: 'Keep reading', onClick: closeLessonSuccess }}
        onClose={closeLessonSuccess}
      />

      <GenerationSuccessModal
        open={generation.status === 'success' && !!documentSuccess}
        heading="Your document is ready!"
        message={
          documentSuccess
            ? `Studifree read “${documentSuccess.name}” and added its text to your source material.`
            : 'Your document has been processed.'
        }
        kind="document"
        saved={false}
        summary={
          documentSuccess
            ? [
                { label: 'Document', value: documentSuccess.name },
                { label: 'Pages', value: `${documentSuccess.pages}` },
                { label: 'Characters', value: `${documentSuccess.characters}` },
              ]
            : undefined
        }
        primary={{ label: 'Use this document', onClick: closeDocumentSuccess }}
        secondary={
          topic.trim()
            ? { label: 'Generate explanation', onClick: useDocumentForLesson }
            : undefined
        }
        onClose={closeDocumentSuccess}
      />

      <GenerationErrorModal
        open={generation.status === 'error'}
        title={
          pendingLesson
            ? 'Your lesson is ready, but it could not be saved.'
            : generation.taskType === 'document'
              ? 'That document could not be read.'
              : 'That explanation could not be prepared.'
        }
        message={
          pendingLesson
            ? 'Studifree could not confirm that the lesson was written to this browser. The generated lesson is still here.'
            : generation.error ?? 'Something went wrong during this request.'
        }
        savingFailed={!!pendingLesson}
        retryLabel={
          pendingLesson ? 'Try saving again' : generation.taskType === 'document' ? 'Try again' : 'Try again'
        }
        onRetry={retryGeneration}
        onClose={() => generation.reset()}
      />

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="How to use Learn">
        <div className="space-y-3 text-sm text-muted">
          <p><strong className="text-ink">What it does:</strong> Teaches one concept at a time using your chosen style.</p>
          <p><strong className="text-ink">How to use:</strong> Type a topic, pick a style, press Explain. Use the buttons to go deeper.</p>
          <p><strong className="text-ink">Example:</strong> Topic "Photosynthesis", style "Beginner".</p>
          <p><strong className="text-ink">Common mistakes:</strong> Asking for too much at once. Keep topics focused.</p>
          <p><strong className="text-ink">If it fails:</strong> Check your API key in AI Setup.</p>
        </div>
      </Dialog>
    </div>
  )
}
