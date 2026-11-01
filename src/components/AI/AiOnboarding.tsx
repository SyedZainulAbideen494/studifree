import React, { useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '../UI/Button'
import { useAppStore } from '../../store/useAppStore'
import { notify } from '../../store/useAiEventsStore'
import { fallbackManager } from '../../services/ai/fallbackManager'
import { modelRegistry } from '../../services/ai/modelRegistry'
import { verifyAiConnection } from '../../services/ai/availability'
import { classifyConnectionFailure } from '../../services/ai/connection'
import { aiLinks, aiResourceLinks } from '../../data/aiLinks'
import { AiKeyVisual } from './AiKeyVisual'
import { SetupProgress } from './SetupProgress'

interface Props {
  mode?: 'setup' | 'change'
  onStartLearning: () => void
  onExploreModels: () => void
  onLater: () => void
}

const benefits = [
  {
    title: 'Your own usage allowance',
    body: "Your API requests use the quota assigned to your own Google AI account and project. You're not sharing one central Studifree API allowance with every other learner.",
    icon: KeyRound,
  },
  {
    title: 'Start with available free-tier usage',
    body: 'Google offers free-tier access for eligible models and usage. Depending on current availability, this may let you use supported AI features without paying.',
    icon: Sparkles,
  },
  {
    title: 'More control over your AI',
    body: 'Choose from compatible Gemini models and manage your preferred model and fallback settings.',
    icon: Sparkles,
  },
  {
    title: 'Your learning, your pace',
    body: 'Use your available quota for your own lessons, explanations, notes, flashcards and practice questions.',
    icon: Sparkles,
  },
]

const questions = [
  {
    q: 'Do I need to know programming?',
    a: 'Not at all! You only need to create and copy a key. Studifree handles the technical connection.',
  },
  {
    q: 'Does creating a key take long?',
    a: 'For most users, the process is very quick. You simply sign in, create a key and paste it into Studifree.',
  },
  {
    q: 'Do I need to pay?',
    a: "Google provides free-tier access for eligible Gemini models and usage. You may be able to use AI without paying, but quotas and pricing vary. Always check the current Google pricing information.",
  },
  {
    q: "Why shouldn't Studifree just give everyone one API key?",
    a: 'Using your own key gives you an individual usage allowance associated with your own Google account and project, rather than depending on a shared application-wide allowance.',
  },
  {
    q: 'Can I remove my key?',
    a: 'Yes. You can remove or replace it at any time through AI Setup.',
  },
  {
    q: 'What if I reach my quota?',
    a: "You can wait for your quota to reset, select another compatible model if available, or review Google's usage options.",
  },
]

function ExternalTextLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 underline underline-offset-2 decoration-line-strong hover:decoration-ink transition ${className}`}
    >
      {children}
      <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/**
 * Beginner-first onboarding for connecting a personal Gemini key.
 *
 * The key is only saved after a real connection test succeeds. Nothing is
 * requested until the learner presses “Connect my AI”.
 */
export const AiOnboarding: React.FC<Props> = ({
  mode = 'setup',
  onStartLearning,
  onExploreModels,
  onLater,
}) => {
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const reduced = useReducedMotion()
  const [apiKey, setApiKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'working' | 'success'>('idle')
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [connectedModel, setConnectedModel] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentStep = phase === 'success' ? 3 : apiKey.trim() ? 2 : 1
  const currentModelLabel = useMemo(() => {
    const id = connectedModel ?? settings.ai?.model
    if (!id) return ''
    return modelRegistry.getModel(id)?.displayName ?? id
  }, [connectedModel, settings.ai?.model])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const clearKey = () => {
    setApiKey('')
    setError(null)
    inputRef.current?.focus()
  }

  const pasteKey = async () => {
    try {
      const text = await navigator.clipboard?.readText?.()
      if (text?.trim()) {
        setApiKey(text.trim())
        setError(null)
      }
    } catch {
      /* Clipboard access is optional; the learner can still paste normally. */
    } finally {
      inputRef.current?.focus()
    }
  }

  const connect = async () => {
    const key = apiKey.trim()
    setError(null)

    if (!key) {
      setError('Paste your Gemini API key to continue. You can open Google AI Studio above to create one.')
      inputRef.current?.focus()
      return
    }

    setPhase('working')
    setStatusText('Checking your key with Google…')

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)

    try {
      // Discovery is the existing provider check: it authenticates the key and
      // returns the models actually available to this account.
      await modelRegistry.refresh(key, true, controller.signal)

      const textModels = modelRegistry.sortedForTask('text')
      const preferredId = settings.ai?.model || fallbackManager.getPolicy().preferredModel
      const candidates = textModels.length
        ? [
            ...textModels.filter((m) => m.id === preferredId),
            ...textModels.filter((m) => m.id !== preferredId),
          ]
            .slice(0, 3)
            .map((m) => ({ id: m.id, displayName: m.displayName }))
        : [
            {
              id: preferredId,
              displayName: modelRegistry.getModel(preferredId)?.displayName ?? preferredId,
            },
          ]

      if (!candidates.length || !candidates[0].id) {
        setError('Your current model is unavailable. Try another compatible model.')
        setPhase('idle')
        return
      }

      let working: { id: string; displayName: string } | null = null
      let failureMessage = 'Your current model is unavailable. Try another compatible model.'

      // A discovered model can still be busy or retired; try up to three real
      // text models before asking the learner to intervene.
      for (const candidate of candidates) {
        setStatusText(`Testing ${candidate.displayName}…`)
        const result = await verifyAiConnection(key, candidate.id)
        if (result.ok) {
          working = candidate
          break
        }
        const failure = classifyConnectionFailure({ message: result.error ?? 'Connection failed.' })
        if (result.kind) failure.kind = result.kind
        if (result.friendly) failure.message = result.friendly
        failureMessage = failure.message
        if (failure.kind !== 'model') break
      }

      if (!working) {
        setError(failureMessage)
        setPhase('idle')
        return
      }

      const fallback =
        textModels.find((m) => m.id !== working.id)?.id ||
        settings.ai?.fallbackModel ||
        'gemini-2.5-flash-lite'

      // Save only after the learner explicitly connects and the test succeeds.
      update({
        ai: {
          provider: 'gemini',
          apiKey: key,
          model: working.id,
          fallbackModel: fallback,
        },
      })
      fallbackManager.setPreferredModel(working.id)
      setConnectedModel(working.id)
      setPhase('success')
      setStatusText('')
      notify('success', 'AI connected', 'Your Gemini key is saved in this browser.')
    } catch (err) {
      const failure = classifyConnectionFailure(err)
      setError(failure.message)
      setPhase('idle')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  if (phase === 'success') {
    return (
      <div className="px-5 pt-6 pb-10 max-w-3xl mx-auto">
        <SetupProgress current={3} className="mb-6" />

        <motion.section
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="rounded-[2rem] glass border border-line-strong shadow-float overflow-hidden"
        >
          <div className="relative px-6 sm:px-10 py-12 sm:py-14 text-center">
            <div className="absolute inset-x-0 top-0 h-40 bg-accent-soft blur-3xl opacity-60" aria-hidden="true" />
            <motion.div
              initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: reduced ? 0 : 0.08 }}
              className="relative mx-auto w-20 h-20 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-float"
            >
              <Check className="w-9 h-9" strokeWidth={2} aria-hidden="true" />
            </motion.div>

            <h1 className="relative mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              You&apos;re all set!
            </h1>
            <p className="relative mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-lg mx-auto">
              Your Gemini connection is ready. Studifree can now help you learn, revise and practise with
              AI-powered tools.
            </p>
            {currentModelLabel && (
              <p className="relative mt-2 text-xs text-faint">
                Connected with {currentModelLabel}. You can change the model any time in AI Setup.
              </p>
            )}

            <div className="relative mt-7 flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="lg" onClick={onStartLearning}>
                Start learning <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="secondary" onClick={onExploreModels}>
                Explore AI models
              </Button>
            </div>

            <p className="relative mt-6 text-xs text-faint flex items-start justify-center gap-2 text-left max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Your key is stored only in this browser. You can remove or replace it any time in AI Setup.
              </span>
            </p>
          </div>
        </motion.section>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-3xl mx-auto space-y-8 sm:space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] glass border border-line-strong shadow-float">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-accent-soft blur-3xl opacity-70" aria-hidden="true" />
        <div className="relative p-6 sm:p-10 sm:pr-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {mode === 'change' ? 'Update your AI' : 'Optional AI upgrade'}
            </span>
            <h1 className="mt-4 text-[30px] sm:text-4xl font-semibold tracking-tight text-ink leading-[1.1]">
              {mode === 'change' ? 'Connect a fresh AI key.' : 'Your own AI. Your own learning space.'}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-xl">
              {mode === 'change'
                ? 'Replace your Gemini API key whenever you like. Your lessons, flashcards, quizzes and other study data stay exactly where they are.'
                : "You're just a minute away from unlocking a much more personalised learning experience."}
            </p>
            {mode === 'setup' && (
              <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed max-w-xl">
                Connect your own Gemini API key and start turning topics into explanations, notes,
                flashcards and quizzes.
              </p>
            )}

            <p className="mt-5 inline-flex items-center gap-2 text-xs text-faint">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Setup takes approximately 1–2 minutes
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              {mode === 'change' ? (
                <Button size="lg" onClick={() => scrollTo('connect-key')}>
                  Enter a new key <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <a
                  href={aiLinks.apiKey}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 px-6 py-3 text-base bg-accent text-accent-ink shadow-soft hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  Get my free API key <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only"> (opens Google AI Studio in a new tab)</span>
                </a>
              )}
              <Button size="lg" variant="secondary" onClick={() => scrollTo('why-own-key')}>
                Why do I need one?
              </Button>
            </div>
          </div>

          <AiKeyVisual className="hidden lg:flex justify-center" />
        </div>
      </section>

      <SetupProgress current={currentStep} />

      {/* Why your own key */}
      <section id="why-own-key" aria-labelledby="why-own-key-heading" className="scroll-mt-6 space-y-4">
        <div>
          <h2 id="why-own-key-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Why use your own API key?
          </h2>
          <div className="mt-3 space-y-2.5 text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
            <p>Every learner deserves their own AI learning space.</p>
            <p>
              By connecting your own Gemini API key, your AI requests use the quota and usage limits
              associated with your own Google AI account and project.
            </p>
            <p>
              That means you&apos;re not depending on one shared Studifree API key or a common
              application-wide usage allowance. You get more control over your own usage, can choose
              supported models and can continue learning according to your available quota.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="rounded-3xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-ink" aria-hidden="true" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-faint">0{index + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{benefit.title}</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{benefit.body}</p>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 rounded-2xl border border-line bg-inset px-4 py-3 text-xs text-muted leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-ink" aria-hidden="true" />
          <span>
            Free usage is subject to Google&apos;s current quotas, model availability and terms. Some
            usage may be paid.
          </span>
        </p>
      </section>

      {/* Three steps */}
      <section aria-labelledby="steps-heading" className="space-y-4">
        <div>
          <h2 id="steps-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Getting your key is easier than you think.
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            You don&apos;t need to know how to code. Just follow these three steps.
          </p>
        </div>

        <ol className="space-y-3">
          <li className="rounded-3xl border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-accent-ink text-sm font-semibold flex items-center justify-center shrink-0">
                1
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-ink">Open Google AI Studio</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Sign in with your Google account. This is where you&apos;ll create your personal
                  Gemini API key.
                </p>
                <a
                  href={aiLinks.apiKey}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 px-5 py-2.5 text-sm bg-accent text-accent-ink shadow-soft hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  Open Google AI Studio <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </li>

          <li className="rounded-3xl border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-accent-ink text-sm font-semibold flex items-center justify-center shrink-0">
                2
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-ink">Create your API key</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Click <span className="text-ink font-medium">Create API key</span>, select an eligible
                  Google Cloud project if prompted, and generate your key.
                </p>
                <p className="mt-2 text-xs text-faint leading-relaxed">
                  Google may ask you to choose or create a project before the key is generated. That is
                  normal, and you can use the project Google suggests.
                </p>
              </div>
            </div>
          </li>

          <li id="connect-key" className="rounded-3xl border border-line-strong bg-surface p-5 scroll-mt-6">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-accent-ink text-sm font-semibold flex items-center justify-center shrink-0">
                3
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-ink">Copy and connect</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Copy your newly generated API key, return here and paste it into the box below.
                </p>

                <div
                  className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-inset px-3 py-2 text-[11px] text-faint"
                  aria-hidden="true"
                >
                  <span className="inline-flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Google key</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="inline-flex items-center gap-1"><Globe2 className="w-3.5 h-3.5" /> Studifree</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                </div>

                <div className="mt-5">
                  <label htmlFor="gemini-api-key" className="block text-sm text-muted mb-1.5">
                    Gemini API key
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      ref={inputRef}
                      id="gemini-api-key"
                      type={visible ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value)
                        if (error) setError(null)
                      }}
                      onPaste={() => setError(null)}
                      placeholder="Paste your Gemini API key here"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      disabled={phase === 'working'}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'gemini-api-key-error' : 'gemini-api-key-hint'}
                      className="w-full pl-10 pr-28 py-3 rounded-2xl bg-inset border border-line text-ink placeholder:text-faint focus:outline-none focus:border-line-strong transition disabled:opacity-60"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      {apiKey && (
                        <button
                          type="button"
                          onClick={clearKey}
                          className="p-2 rounded-lg text-faint hover:text-ink hover:bg-accent-soft transition"
                          aria-label="Clear API key"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={pasteKey}
                        className="p-2 rounded-lg text-faint hover:text-ink hover:bg-accent-soft transition"
                        aria-label="Paste API key from clipboard"
                        title="Paste from clipboard"
                      >
                        <ClipboardPaste className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="p-2 rounded-lg text-faint hover:text-ink hover:bg-accent-soft transition"
                        aria-label={visible ? 'Hide API key' : 'Show API key'}
                        aria-pressed={visible}
                      >
                        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p id="gemini-api-key-hint" className="mt-1.5 text-xs text-faint leading-relaxed">
                    Your key is stored only in this browser. Studifree never logs it or sends it anywhere
                    except Google&apos;s Gemini API when you use an AI feature.
                  </p>
                  {error && (
                    <p
                      id="gemini-api-key-error"
                      role="alert"
                      className="mt-2 flex items-start gap-2 rounded-xl border border-line-strong bg-inset px-3 py-2 text-xs text-ink leading-relaxed"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{error}</span>
                    </p>
                  )}
                  {error && (
                    <p className="mt-2 text-xs text-muted">
                      <ExternalTextLink href={aiLinks.apiKey}>Open Google AI Studio</ExternalTextLink>{' '}
                      to check or create a key.
                    </p>
                  )}
                  {phase === 'working' && (
                    <p role="status" aria-live="polite" className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      {statusText}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={connect}
                    loading={phase === 'working'}
                    className="sm:min-w-[12rem]"
                  >
                    {phase === 'working' ? 'Connecting…' : 'Connect my AI'}
                  </Button>
                  <Button variant="secondary" onClick={onLater} disabled={phase === 'working'}>
                    {mode === 'change' ? 'Cancel' : "I'll do this later"}
                  </Button>
                </div>

                <p className="mt-3 flex items-start gap-2 text-[11px] text-faint leading-relaxed">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    We test the key before saving it. Nothing is saved if the connection fails, and your
                    study data is never changed.
                  </span>
                </p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* Reassurance */}
      <section aria-labelledby="reassurance-heading" className="space-y-4">
        <h2 id="reassurance-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          Still wondering if it&apos;s worth it?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {questions.map((item) => (
            <div key={item.q} className="rounded-2xl border border-line bg-surface p-4">
              <h3 className="text-sm font-semibold text-ink">{item.q}</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-faint leading-relaxed">
          Studifree does not promise unlimited AI or permanent free access. Google controls model
          availability, quotas and pricing.
        </p>
      </section>

      {/* Links */}
      <section aria-labelledby="useful-links-heading" className="space-y-4">
        <h2 id="useful-links-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          Useful links
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {aiResourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-line bg-surface p-4 hover:bg-elevated hover:border-line-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-ink">{link.title}</span>
                <ExternalLink
                  className="w-4 h-4 text-faint group-hover:text-ink transition shrink-0"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-xs text-muted leading-relaxed">{link.description}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </section>

      <p className="text-center text-sm text-muted leading-relaxed px-4 pb-2">
        Getting your own AI key is easier than you think. Connect it once, and make your learning
        experience your own.
      </p>
    </div>
  )
}
