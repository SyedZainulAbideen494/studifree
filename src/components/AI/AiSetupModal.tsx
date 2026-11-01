import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  Key,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '../UI/Button'
import { useAiUiStore } from '../../store/useAiUiStore'
import { aiLinks } from '../../data/aiLinks'

const AI_STUDIO_KEY_URL = aiLinks.apiKey
const AI_STUDIO_URL = aiLinks.studio
const GEMINI_DOCS_URL = aiLinks.docs
const GEMINI_PRICING_URL = aiLinks.pricing
const GEMINI_MODELS_URL = aiLinks.models

const features = [
  {
    icon: GraduationCap,
    title: 'AI Personal Teacher',
    description: 'Learn any topic with patient explanations written for your level.',
    points: ['Simplify difficult concepts', 'Step-by-step explanations', 'Examples, analogies and follow-up questions'],
    to: '/learn',
    cta: 'Open Learn',
  },
  {
    icon: Layers,
    title: 'AI Flashcard Generator',
    description: 'Turn a topic or your own material into a revision deck.',
    points: ['Generate cards from topics', 'Use uploaded PDFs as source material', 'Review with spaced repetition'],
    to: '/flashcards',
    cta: 'Open Flashcards',
  },
  {
    icon: ClipboardCheck,
    title: 'AI Quiz Studio',
    description: 'Practise with generated questions and see what needs work.',
    points: ['Practice and exam-style quizzes', 'Explanations for every answer', 'Track weak concepts over time'],
    to: '/quiz',
    cta: 'Open Quiz Studio',
  },
  {
    icon: FileText,
    title: 'Structured notes & summaries',
    description: 'AI lessons are organised into clear sections you can keep and export.',
    points: ['Key points and common misconceptions', 'Memory tricks and knowledge checks', 'Save to your library or export as PDF'],
    to: '/learn',
    cta: 'Open Learn',
  },
  {
    icon: ScrollText,
    title: 'Document understanding',
    description: 'Upload supported PDFs and images, then learn from their contents.',
    points: ['Extract text from PDFs locally', 'Explain images and diagrams', 'Generate study material from a source'],
    to: '/learn',
    cta: 'Upload a document',
  },
  {
    icon: Zap,
    title: 'Automatic model fallback',
    description: 'If one Gemini model is busy, Studifree can try another compatible model.',
    points: ['Task-based model routing', 'Live model discovery', 'You stay in control of the chain'],
    to: '/ai-setup',
    cta: 'Open AI Setup',
  },
]

const steps = [
  {
    title: 'Open Google AI Studio',
    body: 'Visit the official API key page in a new tab and sign in with your Google account.',
    icon: ExternalLink,
  },
  {
    title: 'Create your API key',
    body: 'Press “Create API key” and choose or create a Google Cloud project if prompted.',
    icon: Key,
  },
  {
    title: 'Connect it in Studifree',
    body: 'Copy the key, return to AI Setup, paste it and press Connect my AI. We test it before saving.',
    icon: ShieldCheck,
  },
]

export const AiSetupModal: React.FC = () => {
  const open = useAiUiStore((s) => s.setupOpen)
  const close = useAiUiStore((s) => s.closeSetup)
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const previousFocus = document.activeElement as HTMLElement | null
    window.setTimeout(() => closeRef.current?.focus(), 40)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [open, close])

  const go = (to: string) => {
    close()
    navigate(to)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-setup-modal-title"
            aria-describedby="ai-setup-modal-subtitle"
            initial={reduced ? { opacity: 0 } : { y: 32, opacity: 0, scale: 0.985 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-surface border border-line shadow-float overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start gap-4 px-5 sm:px-7 pt-5 sm:pt-7 pb-4 border-b border-line bg-surface/95 backdrop-blur">
              <div className="w-11 h-11 rounded-2xl bg-accent-soft border border-line flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="ai-setup-modal-title" className="text-lg sm:text-xl font-semibold text-ink tracking-tight">
                  Bring AI into your learning experience.
                </h2>
                <p id="ai-setup-modal-subtitle" className="text-sm text-muted mt-1 leading-relaxed">
                  Studifree uses AI to help explain difficult concepts, create study materials and make learning
                  more personal.
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={close}
                className="p-2 rounded-xl text-muted hover:text-ink hover:bg-accent-soft transition"
                aria-label="Close AI setup guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-6 space-y-9">
              {/* A */}
              <section aria-labelledby="ai-why-heading">
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint mb-2">A · The basics</p>
                <h3 id="ai-why-heading" className="text-base font-semibold text-ink">
                  Why do I need an API key?
                </h3>
                <div className="mt-3 space-y-2.5 text-sm text-muted leading-relaxed">
                  <p>
                    Studifree is free to use and does not require an account for your local study tools. AI features
                    are different: the explanations and flashcards are generated by a large language model, not by
                    Studifree itself.
                  </p>
                  <p>
                    An API key is a personal access token that connects Studifree to Google&apos;s Gemini API using
                    your own Google account. Google processes each request under your account and applies its own
                    quotas, availability and pricing. Studifree does not promise unlimited free AI usage.
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-line bg-inset p-4">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-ink">
                    {['You', 'Studifree', 'Gemini API', 'AI response', 'Studifree'].map((label, i) => (
                      <React.Fragment key={`${label}-${i}`}>
                        <span className="px-2.5 py-1.5 rounded-lg bg-surface border border-line whitespace-nowrap">
                          {label}
                        </span>
                        {i < 4 && <ArrowRight className="w-3.5 h-3.5 text-faint" aria-hidden="true" />}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-[11px] text-faint text-center mt-3">
                    Your prompt leaves your browser only when you use an AI feature.
                  </p>
                </div>
              </section>

              {/* B */}
              <section aria-labelledby="ai-features-heading">
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint mb-2">B · What you unlock</p>
                <h3 id="ai-features-heading" className="text-base font-semibold text-ink">
                  What can I do after adding my key?
                </h3>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {features.map((f) => (
                    <button
                      key={f.title}
                      onClick={() => go(f.to)}
                      className="group text-left rounded-2xl border border-line bg-surface p-4 hover:bg-elevated hover:border-line-strong transition"
                    >
                      <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center mb-3">
                        <f.icon className="w-4 h-4 text-ink" />
                      </div>
                      <h4 className="text-sm font-semibold text-ink">{f.title}</h4>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{f.description}</p>
                      <ul className="mt-2.5 space-y-1">
                        {f.points.map((p) => (
                          <li key={p} className="text-[11px] text-faint flex items-start gap-1.5">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                      <span className="text-[11px] text-ink mt-3 inline-flex items-center gap-1 opacity-70 group-hover:opacity-100">
                        {f.cta} <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* C */}
              <section aria-labelledby="ai-key-heading">
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint mb-2">C · Step by step</p>
                <h3 id="ai-key-heading" className="text-base font-semibold text-ink">
                  How to get your Gemini API key
                </h3>
                <ol className="mt-3 space-y-2.5">
                  {steps.map((s, i) => (
                    <li key={s.title} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3">
                      <span className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-xs font-semibold text-ink shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                          <s.icon className="w-3.5 h-3.5 text-faint" aria-hidden="true" />
                          {s.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(AI_STUDIO_KEY_URL, '_blank', 'noopener,noreferrer')}
                  >
                    Open Google AI Studio <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(GEMINI_DOCS_URL, '_blank', 'noopener,noreferrer')}
                  >
                    Gemini API docs <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-faint mt-2">
                  Google controls current models, quotas and pricing. Check the official{' '}
                  <a href={GEMINI_PRICING_URL} target="_blank" rel="noreferrer" className="underline text-muted">
                    pricing
                  </a>{' '}
                  and{' '}
                  <a href={GEMINI_MODELS_URL} target="_blank" rel="noreferrer" className="underline text-muted">
                    model
                  </a>{' '}
                  pages for current details.
                </p>
              </section>

              {/* D */}
              <section aria-labelledby="ai-safety-heading">
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint mb-2">D · Safety</p>
                <h3 id="ai-safety-heading" className="text-base font-semibold text-ink">
                  Is my API key safe?
                </h3>
                <div className="mt-3 space-y-2.5 text-sm text-muted leading-relaxed">
                  <p>
                    Your key authenticates requests to Google. In a browser-only app it is stored in this
                    browser&apos;s local storage and used directly by the page. That is convenient, but it is not
                    completely secure: someone with access to this browser profile, or with enough technical
                    knowledge of the running page, may be able to read it. Avoid using a shared device.
                  </p>
                  <p>
                    Studifree never logs your key or includes it in error messages. The recommended approach for a
                    public deployment is a small backend proxy that keeps the key on the server; this app is
                    designed so that can be added later.
                  </p>
                  <p>
                    Where Google supports it, restrict the key to the websites and APIs you actually use, and set
                    quotas to limit unexpected usage. You can remove the key from Studifree at any time in AI Setup.
                  </p>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-faint rounded-2xl border border-line bg-inset p-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Manual flashcards, local notes and other study tools keep working without a key. AI is an
                    optional assistant, not a requirement for using Studifree.
                  </span>
                </div>
              </section>

              {/* E */}
              <section aria-labelledby="ai-action-heading">
                <p className="text-[11px] uppercase tracking-[0.14em] text-faint mb-2">E · Ready</p>
                <h3 id="ai-action-heading" className="text-base font-semibold text-ink">
                  Add your key in AI Setup
                </h3>
                <p className="text-sm text-muted mt-2">
                  The existing AI Setup page holds your key, discovers available models and lets you test the
                  connection before you start.
                </p>
              </section>
            </div>

            {/* Footer actions */}
            <div className="border-t border-line bg-surface/95 backdrop-blur px-5 sm:px-7 py-4 flex flex-col sm:flex-row gap-2">
              <Button onClick={() => go('/ai-setup')} className="flex-1">
                <Key className="w-4 h-4" /> Add my API key
              </Button>
              <Button variant="secondary" onClick={close} className="flex-1 sm:flex-none sm:px-6">
                Maybe later
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* Re-exported so the banner and empty states can link to the same docs. */
export const officialLinks = {
  studio: AI_STUDIO_URL,
  apiKey: AI_STUDIO_KEY_URL,
  docs: GEMINI_DOCS_URL,
  pricing: GEMINI_PRICING_URL,
  models: GEMINI_MODELS_URL,
}
