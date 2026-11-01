import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  KeyRound,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '../UI/Button'
import { Switch } from '../UI/Switch'
import { useAppStore } from '../../store/useAppStore'
import { notify } from '../../store/useAiEventsStore'
import { useAiAvailability } from '../../hooks/useAiAvailability'
import { modelRegistry } from '../../services/ai/modelRegistry'
import { fallbackManager } from '../../services/ai/fallbackManager'
import { clearVerification, verifyAiConnection } from '../../services/ai/availability'
import { classifyConnectionFailure } from '../../services/ai/connection'
import { aiLinks } from '../../data/aiLinks'
import { formatDate } from '../../utils/format'

interface Props {
  onOpenModels: () => void
  onChangeKey: () => void
  onRemove: () => void
}

/* Re-render when model discovery or fallback policy changes. */
function useAiRegistry() {
  const [, force] = useState(0)
  useEffect(() => modelRegistry.subscribe(() => force((v) => v + 1)), [])
  useEffect(() => fallbackManager.subscribe(() => force((v) => v + 1)), [])
  return {
    health: modelRegistry.getHealth(),
    policy: fallbackManager.getPolicy(),
    chain: fallbackManager.buildChain('explain'),
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line last:border-0">
      <span className="text-xs text-faint shrink-0">{label}</span>
      <span className="text-sm text-ink text-right min-w-0 break-words">{value}</span>
    </div>
  )
}

/**
 * Post-connection dashboard. Status is derived from the real verification
 * record — never from the mere presence of a saved key.
 */
export const AiDashboard: React.FC<Props> = ({ onOpenModels, onChangeKey, onRemove }) => {
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const ai = useAiAvailability()
  const { health, policy, chain } = useAiRegistry()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const savedKey = settings.ai?.apiKey ?? ''
  const modelId = settings.ai?.model ?? ''
  const model = modelRegistry.getModel(modelId)
  const modelLabel = model?.displayName ?? modelId
  const fallbackId =
    settings.ai?.fallbackModel || chain.find((id) => id !== modelId) || ''
  const fallbackLabel = modelRegistry.getModel(fallbackId)?.displayName ?? fallbackId
  const lastSuccess = useMemo(() => {
    const times = Object.values(health)
      .map((h) => h.lastSuccess)
      .filter((t): t is number => typeof t === 'number')
    return times.length ? Math.max(...times) : undefined
  }, [health])

  const connected = ai.status === 'connected'
  const failed = ai.status === 'failed' || ai.status === 'invalid-model'

  const runTest = async () => {
    if (!savedKey || !modelId || testing) return
    setTesting(true)
    setTestResult(null)
    const result = await verifyAiConnection(savedKey, modelId)
    setTesting(false)

    if (result.ok) {
      setTestResult({ ok: true, message: 'Connected successfully. Your AI is ready.' })
      notify('success', 'Connection confirmed', 'Your Gemini key and selected model are working.')
      return
    }

    const message =
      result.friendly ?? classifyConnectionFailure({ message: result.error ?? '' }).message
    setTestResult({ ok: false, message })
    notify('warning', 'Connection needs attention', message)
  }

  const removeKey = () => {
    update({ ai: undefined })
    modelRegistry.clearCache()
    clearVerification()
    setConfirmRemove(false)
    notify('info', 'API key removed', 'Your study data is unchanged. You can connect a key again any time.')
    onRemove()
  }

  const statusPill = connected
    ? 'Connected'
    : failed
      ? 'Needs attention'
      : 'Key saved · not tested'

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] glass border border-line-strong shadow-float">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-accent-soft blur-3xl opacity-60" aria-hidden="true" />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                failed
                  ? 'bg-inset border-line-strong text-ink'
                  : connected
                    ? 'bg-accent text-accent-ink border-accent'
                    : 'bg-accent-soft border-line text-ink'
              }`}
            >
              {failed ? (
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              ) : connected ? (
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <CircleDashed className="w-5 h-5" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-ink' : failed ? 'bg-faint' : 'bg-line-strong border border-line-strong'}`}
                  aria-hidden="true"
                />
                {statusPill}
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-ink leading-tight">
                {connected
                  ? 'Your AI is connected and ready to help you learn.'
                  : failed
                    ? 'Your AI connection needs attention.'
                    : 'Your key is saved. Let’s confirm it works.'}
              </h1>
              <p className="mt-2 text-sm text-muted leading-relaxed max-w-xl">
                {connected
                  ? 'Ask a topic in Learn, generate flashcards, or build a practice quiz. Your key powers only the AI features you choose.'
                  : ai.message}
              </p>
              {failed && ai.detail && (
                <p className="mt-2 text-xs text-muted leading-relaxed">{ai.detail}</p>
              )}
              {testResult && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 rounded-xl border border-line bg-inset px-3 py-2 text-xs text-ink leading-relaxed"
                >
                  {testResult.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={runTest} loading={testing} disabled={!savedKey || !modelId}>
              {testing ? (
                'Testing…'
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" /> Test connection
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={onChangeKey}>
              <KeyRound className="w-4 h-4" aria-hidden="true" /> Change API key
            </Button>
            <Button variant="secondary" onClick={onOpenModels}>
              <Settings2 className="w-4 h-4" aria-hidden="true" /> Model Manager
            </Button>
            {!confirmRemove ? (
              <Button variant="ghost" onClick={() => setConfirmRemove(true)}>
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Remove API key
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-inset px-2 py-1">
                <span className="text-xs text-muted pl-1">Remove this key?</span>
                <Button size="sm" variant="danger" onClick={removeKey}>
                  Yes, remove
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>
                  Cancel
                </Button>
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">Connection details</h2>
          <div className="mt-2">
            <Row label="Provider" value="Google Gemini" />
            <Row
              label="Selected model"
              value={
                <span>
                  {modelLabel}
                  {modelId && modelLabel !== modelId && (
                    <span className="block text-[11px] text-faint break-all">{modelId}</span>
                  )}
                </span>
              }
            />
            <Row
              label="Fallback"
              value={
                policy.autoFailover
                  ? fallbackLabel
                    ? `Automatic · next: ${fallbackLabel}`
                    : 'Automatic'
                  : 'Off'
              }
            />
            <Row
              label="API key"
              value={<span className="font-mono tracking-[0.2em]">••••••••</span>}
            />
            <Row
              label="Last verified"
              value={
                ai.lastCheckedAt
                  ? formatDate(ai.lastCheckedAt)
                  : lastSuccess
                    ? formatDate(lastSuccess)
                    : 'Not verified yet'
              }
            />
          </div>
          <a
            href={aiLinks.models}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted underline underline-offset-2 hover:text-ink transition"
          >
            Official Gemini models and quotas
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Automatic model switching</h2>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                If your preferred model is busy or unavailable, Studifree can try another compatible
                Gemini model automatically.
              </p>
            </div>
            <Switch
              checked={policy.autoFailover}
              onChange={(value) => fallbackManager.setAutoFailover(value)}
              ariaLabel="Switch models automatically when the preferred model is unavailable"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-inset p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-faint">Current fallback</p>
            <p className="mt-1 text-sm text-ink">
              {policy.autoFailover
                ? fallbackLabel
                  ? `Next: ${fallbackLabel}`
                  : 'A compatible model will be chosen when needed.'
                : 'Automatic switching is off.'}
            </p>
            <p className="mt-1 text-[11px] text-faint leading-relaxed">
              Retries and fallback requests can use additional quota. Switching models does not create a
              separate allowance or guarantee free usage.
            </p>
          </div>

          <Button size="sm" variant="ghost" className="mt-3" onClick={onOpenModels}>
            Manage models <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </section>
      </div>

      <p className="flex items-start gap-2 text-[11px] text-faint leading-relaxed px-1">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          The key is stored in this browser only and is never displayed again. Remove it any time; your
          lessons, decks and quizzes stay on this device. Manual study tools work without AI.
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={aiLinks.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-elevated transition"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Gemini documentation
          <ExternalLink className="w-3.5 h-3.5 text-faint" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          href={aiLinks.pricing}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-elevated transition"
        >
          Pricing and quotas
          <ExternalLink className="w-3.5 h-3.5 text-faint" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}
