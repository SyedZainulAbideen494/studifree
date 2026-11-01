import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Boxes,
  Brain,
  Check,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { EmptyState } from '../UI/EmptyState'
import { Switch } from '../UI/Switch'
import { Tabs } from '../UI/Tabs'
import { useAppStore } from '../../store/useAppStore'
import { useAiEventsStore } from '../../store/useAiEventsStore'
import { modelRegistry } from '../../services/ai/modelRegistry'
import { fallbackManager } from '../../services/ai/fallbackManager'
import { verifyAiConnection } from '../../services/ai/availability'
import { classifyConnectionFailure } from '../../services/ai/connection'
import type { ModelCategory, ModelMetadata } from '../../types/ai'

const categoryLabels: Record<ModelCategory, string> = {
  'advanced-reasoning': 'Advanced reasoning',
  general: 'General learning',
  fast: 'Fast & economical',
  image: 'Image generation',
  audio: 'Audio & speech',
  embedding: 'Embeddings',
  other: 'Other',
}

const categoryIcons: Record<ModelCategory, React.ComponentType<{ className?: string }>> = {
  'advanced-reasoning': Brain,
  general: Zap,
  fast: Zap,
  image: ImageIcon,
  audio: AudioLines,
  embedding: Boxes,
  other: Boxes,
}

function useRegistry() {
  const [, force] = useState(0)
  useEffect(() => modelRegistry.subscribe(() => force((v) => v + 1)), [])
  useEffect(() => fallbackManager.subscribe(() => force((v) => v + 1)), [])
  return {
    models: modelRegistry.getModels(),
    lastRefresh: modelRegistry.getLastRefresh(),
    lastError: modelRegistry.getLastError(),
    health: modelRegistry.getHealth(),
    policy: fallbackManager.getPolicy(),
  }
}

interface Props {
  initialTab?: string
}

/**
 * The existing model manager, kept as the single place for discovery, model
 * selection, testing and fallback order. It never stores or displays the key.
 */
export const ModelManager: React.FC<Props> = ({ initialTab = 'models' }) => {
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const { models, lastRefresh, lastError, health, policy } = useRegistry()
  const errors = useAiEventsStore((s) => s.errors)
  const switches = useAiEventsStore((s) => s.switches)
  const apiKey = settings.ai?.apiKey ?? ''
  const selectedModel = settings.ai?.model ?? policy.preferredModel ?? 'gemini-2.5-flash'

  const [tab, setTab] = useState(initialTab)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<ModelCategory | 'all'>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<
    Record<string, { ok: boolean; ms: number; message?: string }>
  >({})
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => setTab(initialTab), [initialTab])

  useEffect(() => {
    if (apiKey && modelRegistry.isStale()) {
      modelRegistry.refresh(apiKey).catch(() => {
        /* The friendly message is shown below. */
      })
    }
  }, [apiKey])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return models.filter((m) => {
      if (m.deprecated) return false
      if (cat !== 'all' && m.category !== cat) return false
      if (!q) return true
      return (m.id + ' ' + m.displayName + ' ' + (m.description ?? '')).toLowerCase().includes(q)
    })
  }, [models, search, cat])

  const refreshModels = async () => {
    if (!apiKey) {
      setError('Connect your API key first.')
      return
    }
    setBusy('refresh')
    setError(null)
    setMessage(null)
    try {
      const result = await modelRegistry.refresh(apiKey, true)
      setMessage(`${result.models.length} models found.`)
    } catch (err) {
      setError(classifyConnectionFailure(err).message)
    } finally {
      setBusy(null)
    }
  }

  const chooseModel = (m: ModelMetadata) => {
    if (settings.ai) update({ ai: { ...settings.ai, model: m.id } })
    fallbackManager.setPreferredModel(m.id)
    setMessage(`Selected ${m.displayName}.`)
  }

  const testModel = async (modelId: string) => {
    if (!apiKey) {
      setError('Connect your API key first.')
      return
    }
    setBusy(modelId)
    setError(null)
    const result = await verifyAiConnection(apiKey, modelId)
    setTestResults((prev) => ({
      ...prev,
      [modelId]: {
        ok: result.ok,
        ms: result.ms,
        message: result.ok
          ? 'Connected successfully.'
          : result.friendly ?? classifyConnectionFailure({ message: result.error ?? '' }).message,
      },
    }))
    setBusy(null)
  }

  const chain = fallbackManager.buildChain('explain')
  const move = (id: string, dir: -1 | 1) => {
    const effective = [...chain]
    const idx = effective.indexOf(id)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= effective.length) return
    ;[effective[idx], effective[target]] = [effective[target], effective[idx]]
    fallbackManager.setOrder('text', effective)
  }

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const effective = [...chain]
    const from = effective.indexOf(dragId)
    const to = effective.indexOf(targetId)
    if (from < 0 || to < 0) return
    effective.splice(from, 1)
    effective.splice(to, 0, dragId)
    fallbackManager.setOrder('text', effective)
    setDragId(null)
  }

  return (
    <Card className="mt-2">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Model Manager</h2>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            Choose a model, test it and control automatic switching. All models are discovered from
            your own Google account.
          </p>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'models', label: 'Models' },
          { id: 'fallback', label: 'Fallback' },
          { id: 'testing', label: 'Testing' },
          { id: 'errors', label: 'Activity' },
        ]}
      >
        {(active) => (
          <>
            {active === 'models' && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">Available models</h3>
                      <p className="text-xs text-muted">
                        {models.length} discovered ·{' '}
                        {lastRefresh
                          ? `Last refreshed ${new Date(lastRefresh).toLocaleString()}`
                          : 'Never refreshed'}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={refreshModels}
                      disabled={busy === 'refresh'}
                    >
                      {busy === 'refresh' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}{' '}
                      Refresh
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-faint absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search models..."
                        aria-label="Search models"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-inset border border-line text-ink"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        'all',
                        'advanced-reasoning',
                        'general',
                        'fast',
                        'image',
                        'audio',
                        'embedding',
                      ] as const
                    ).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCat(c as ModelCategory | 'all')}
                        aria-pressed={cat === c}
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
                          cat === c
                            ? 'bg-accent text-accent-ink border-accent'
                            : 'bg-surface text-muted border-line'
                        }`}
                      >
                        {c === 'all' ? 'All' : categoryLabels[c as ModelCategory]}
                      </button>
                    ))}
                  </div>
                </Card>

                {message && <p className="text-sm text-muted">{message}</p>}
                {error && (
                  <p role="alert" className="text-sm text-ink">
                    {error}
                  </p>
                )}
                {lastError && !error && (
                  <p className="text-xs text-faint">
                    Model discovery did not complete. Refresh to try again.
                  </p>
                )}

                {filtered.length === 0 ? (
                  <EmptyState
                    title="No models found"
                    description={
                      models.length
                        ? 'Try a different search or category.'
                        : 'Press Refresh to discover the models available to your key.'
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {filtered.map((m) => {
                      const CatIcon = categoryIcons[m.category]
                      const h = health[m.id]
                      const result = testResults[m.id]
                      return (
                        <Card key={m.id} padded={false} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                              <CatIcon className="w-4 h-4 text-ink" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-ink">{m.displayName}</span>
                                {selectedModel === m.id && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-ink">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted break-all">{m.id}</p>
                              <p className="text-[11px] text-faint mt-0.5">
                                {categoryLabels[m.category]} · {m.capabilities.join(', ')}
                              </p>
                              {h && (
                                <p className="text-[11px] text-faint mt-0.5">
                                  {h.successCount} success · {h.failureCount} failure
                                  {h.avgMs ? ` · ${h.avgMs} ms` : ''}
                                </p>
                              )}
                              {result && (
                                <p
                                  className="text-[11px] text-muted mt-1 leading-relaxed"
                                  role="status"
                                  aria-live="polite"
                                >
                                  {result.ok ? (
                                    <Check className="w-3 h-3 inline" aria-hidden="true" />
                                  ) : (
                                    <X className="w-3 h-3 inline" aria-hidden="true" />
                                  )}{' '}
                                  {result.message} {result.ok ? `${result.ms} ms` : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant={selectedModel === m.id ? 'primary' : 'secondary'}
                                onClick={() => chooseModel(m)}
                              >
                                Select
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => testModel(m.id)}
                                disabled={busy === m.id}
                              >
                                {busy === m.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  'Test'
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {active === 'fallback' && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">Text-learning fallback order</h3>
                      <p className="text-xs text-muted">
                        Drag to reorder, or use the arrows. The first available model is tried first.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => fallbackManager.restoreDefaults()}>
                      <RotateCcw className="w-4 h-4" /> Restore
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-line gap-3">
                    <span className="text-sm text-ink">Automatic switching</span>
                    <Switch
                      checked={policy.autoFailover}
                      onChange={(v) => fallbackManager.setAutoFailover(v)}
                      ariaLabel="Switch models automatically when the preferred model is unavailable"
                    />
                  </div>
                  {chain.length === 0 ? (
                    <EmptyState
                      title="No chain yet"
                      description="Refresh models or let Studifree use the conservative defaults."
                    />
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {chain.map((id, idx) => {
                        const m = models.find((x) => x.id === id)
                        const disabled = policy.disabled.includes(id)
                        return (
                          <li
                            key={id}
                            draggable
                            onDragStart={() => setDragId(id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDrop(id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                              disabled ? 'opacity-50 bg-inset border-line' : 'bg-surface border-line'
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-faint cursor-grab" aria-hidden="true" />
                            <span className="text-xs text-faint w-4">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-ink truncate">{m?.displayName ?? id}</div>
                              <div className="text-[10px] text-faint truncate">{id}</div>
                            </div>
                            <button
                              onClick={() => move(id, -1)}
                              className="p-1 rounded hover:bg-accent-soft text-muted"
                              aria-label={`Move ${m?.displayName ?? id} up`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => move(id, 1)}
                              className="p-1 rounded hover:bg-accent-soft text-muted"
                              aria-label={`Move ${m?.displayName ?? id} down`}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <Switch
                              checked={!disabled}
                              onChange={() => fallbackManager.toggleDisabled(id)}
                              ariaLabel={`Use ${m?.displayName ?? id} in the fallback chain`}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
                <Card>
                  <h3 className="font-semibold text-ink mb-2">Separate task chains</h3>
                  <p className="text-sm text-muted">
                    Image, audio and embedding tasks use their own compatible models and never enter
                    the text chain.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted">
                    <div className="p-2 rounded-xl bg-inset">
                      Image generation · {fallbackManager.buildChain('image-generate').length} models
                    </div>
                    <div className="p-2 rounded-xl bg-inset">
                      Audio · {fallbackManager.buildChain('transcription').length} models
                    </div>
                    <div className="p-2 rounded-xl bg-inset">
                      Embeddings · {fallbackManager.buildChain('embedding').length} models
                    </div>
                    <div className="p-2 rounded-xl bg-inset">
                      Vision · {fallbackManager.buildChain('image-understand').length} models
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {active === 'testing' && (
              <div className="space-y-4">
                <Card>
                  <h3 className="font-semibold text-ink mb-2">Test connection</h3>
                  <p className="text-sm text-muted mb-3">
                    Runs a tiny generation request against the selected model.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => testModel(selectedModel)} disabled={!!busy}>
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}{' '}
                      Test text generation
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={refreshModels}
                      disabled={busy === 'refresh'}
                    >
                      <RefreshCw className="w-4 h-4" /> Test model availability
                    </Button>
                  </div>
                  {testResults[selectedModel] && (
                    <p className="text-sm text-muted mt-3" role="status" aria-live="polite">
                      {testResults[selectedModel].ok ? 'Success' : 'Failed'} in{' '}
                      {testResults[selectedModel].ms} ms.
                      {testResults[selectedModel].message
                        ? ` ${testResults[selectedModel].message}`
                        : ''}
                    </p>
                  )}
                </Card>
                <Card>
                  <h3 className="font-semibold text-ink mb-2">Capability notes</h3>
                  <p className="text-sm text-muted">
                    Image, audio and embedding models are only shown or used for their own task.
                    Studifree never sends text-learning prompts to a model that does not support text
                    generation.
                  </p>
                </Card>
              </div>
            )}

            {active === 'errors' && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-ink">Recent model activity</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useAiEventsStore.getState().clearErrors()}
                    >
                      Clear
                    </Button>
                  </div>
                  {errors.length === 0 ? (
                    <EmptyState
                      title="No issues recorded"
                      description="Model failures and recoveries will appear here."
                    />
                  ) : (
                    <ul className="space-y-2">
                      {errors.map((e) => (
                        <li key={e.id} className="p-3 rounded-xl border border-line">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted">
                              {new Date(e.timestamp).toLocaleString()}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-inset text-faint">
                              {e.code}
                            </span>
                          </div>
                          <p className="text-sm text-ink mt-1">{e.model}</p>
                          <p className="text-xs text-muted">{e.description}</p>
                          <p className="text-xs text-faint mt-1">
                            Recovery: {e.recovery}
                            {e.switchedTo ? ` → ${e.switchedTo}` : ''} ·{' '}
                            {e.fallbackSucceeded ? 'fallback succeeded' : 'not recovered'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                {switches.length > 0 && (
                  <Card>
                    <h3 className="font-semibold text-ink mb-2">Successful switches</h3>
                    <ul className="space-y-1 text-sm text-muted">
                      {switches.slice(0, 10).map((s, i) => (
                        <li key={`${s.timestamp}-${i}`}>
                          {new Date(s.timestamp).toLocaleTimeString()} · {s.fromModel} → {s.toModel} (
                          {s.reason})
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </Tabs>
    </Card>
  )
}
