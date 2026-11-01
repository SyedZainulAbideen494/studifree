import React, { useEffect, useMemo, useState } from 'react'
import { Key, ShieldCheck, ExternalLink, Trash2, RefreshCw, Loader2, Search, GripVertical, ArrowUp, ArrowDown, RotateCcw, Zap, Brain, Image as ImageIcon, AudioLines, Boxes, Check, X } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { Tabs } from '../components/UI/Tabs'
import { Switch } from '../components/UI/Switch'
import { EmptyState } from '../components/UI/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { modelRegistry } from '../services/ai/modelRegistry'
import { fallbackManager, ChainCategory } from '../services/ai/fallbackManager'
import { clearVerification, markAiVerification, verifyAiConnection } from '../services/ai/availability'
import { useAiAvailability } from '../hooks/useAiAvailability'
import { useAiEventsStore } from '../store/useAiEventsStore'
import { formatDate } from '../utils/format'
import type { ModelCategory, ModelMetadata } from '../types/ai'

const categoryLabels: Record<ModelCategory, string> = {
  'advanced-reasoning': 'Advanced reasoning',
  general: 'General learning',
  fast: 'Fast & economical',
  image: 'Image generation',
  audio: 'Audio & speech',
  embedding: 'Embeddings',
  other: 'Other',
}

const categoryIcons: Record<ModelCategory, any> = {
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

export default function AiSetup() {
  const settings = useAppStore((s) => s.settings)
  const ai = useAiAvailability()
  const update = useAppStore((s) => s.updateSettings)
  const { models, lastRefresh, lastError, health, policy } = useRegistry()
  const errors = useAiEventsStore((s) => s.errors)
  const switches = useAiEventsStore((s) => s.switches)
  const [tab, setTab] = useState('connection')
  const [apiKey, setApiKey] = useState(settings.ai?.apiKey ?? '')
  const [selectedModel, setSelectedModel] = useState(settings.ai?.model ?? policy.preferredModel ?? 'gemini-2.5-flash')
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<ModelCategory | 'all'>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; ms: number; error?: string }>>({})
  const [dragId, setDragId] = useState<string | null>(null)

  const keySaved = !!settings.ai?.apiKey

  useEffect(() => {
    if (keySaved && apiKey.trim() && modelRegistry.isStale()) {
      modelRegistry.refresh(apiKey.trim()).catch(() => { /* shown below */ })
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return models.filter((m) => {
      if (m.deprecated) return false
      if (cat !== 'all' && m.category !== cat) return false
      if (!q) return true
      return (m.id + ' ' + m.displayName + ' ' + (m.description ?? '')).toLowerCase().includes(q)
    })
  }, [models, search, cat])

  const saveKey = async () => {
    if (!apiKey.trim()) { setError('Please enter an API key.'); return }
    setBusy('save'); setError(null); setMessage(null)
    try {
      update({ ai: { provider: 'gemini', apiKey: apiKey.trim(), model: selectedModel, fallbackModel: 'gemini-2.5-flash-lite' } })
      fallbackManager.setPreferredModel(selectedModel)
      await modelRegistry.refresh(apiKey.trim(), true)
      setMessage('Key saved and models refreshed.')
    } catch (e: any) {
      const message = e?.message ?? String(e)
      setError(message)
      if (e?.status === 401 || e?.status === 403 || /api key not valid|permission/i.test(message)) {
        markAiVerification(apiKey.trim(), selectedModel, false, message)
      }
      setMessage('Key saved, but model discovery failed. You can still use the conservative fallback list.')
    } finally { setBusy(null) }
  }

  const refreshModels = async () => {
    if (!apiKey.trim()) { setError('Enter an API key first.'); return }
    setBusy('refresh'); setError(null); setMessage(null)
    try {
      const r = await modelRegistry.refresh(apiKey.trim(), true)
      setMessage(`${r.models.length} models discovered.`)
    } catch (e: any) {
      const message = e?.message ?? String(e)
      setError(message)
      if (e?.status === 401 || e?.status === 403 || /api key not valid|permission/i.test(message)) {
        markAiVerification(apiKey.trim(), selectedModel, false, message)
      }
    } finally { setBusy(null) }
  }

  const removeKey = () => {
    update({ ai: undefined })
    setApiKey('')
    modelRegistry.clearCache()
    clearVerification()
    setMessage('API key removed.')
  }

  const chooseModel = (m: ModelMetadata) => {
    setSelectedModel(m.id)
    fallbackManager.setPreferredModel(m.id)
    if (settings.ai) update({ ai: { ...settings.ai, model: m.id } })
    setMessage(`Selected ${m.displayName}.`)
  }

  const testModel = async (modelId: string) => {
    if (!apiKey.trim()) { setError('Enter an API key first.'); return }
    setBusy(modelId); setError(null)
    const r = await verifyAiConnection(apiKey.trim(), modelId)
    setTestResults((prev) => ({ ...prev, [modelId]: r }))
    setBusy(null)
  }

  const chain = fallbackManager.buildChain('explain')
  const move = (id: string, dir: -1 | 1) => {
    const order = [...policy.textOrder]
    // materialise the current effective chain first
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

  const current = models.find((m) => m.id === (settings.ai?.model ?? policy.preferredModel))
  const lastSuccess = Object.values(health).filter((h) => h.lastSuccess).sort((a, b) => (b.lastSuccess ?? 0) - (a.lastSuccess ?? 0))[0]

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">AI Setup & Model Control</h1>
        <p className="text-muted mt-1">Connect Gemini, discover models and control automatic failover.</p>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'connection', label: 'Connection' },
          { id: 'models', label: 'Models' },
          { id: 'fallback', label: 'Fallback' },
          { id: 'testing', label: 'Testing' },
          { id: 'errors', label: 'Error history' },
        ]}
      >
        {(active) => (
          <>
            {active === 'connection' && (
              <div className="space-y-5">
                <Card>
                  <h2 className="font-semibold text-ink mb-2">Current model</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-xs text-muted">Model</div><div className="text-ink">{current?.displayName ?? (settings.ai?.model ?? policy.preferredModel)}</div></div>
                    <div><div className="text-xs text-muted">Provider</div><div className="text-ink">Google Gemini</div></div>
                    <div><div className="text-xs text-muted">Status</div><div className="text-ink">{ai.status === 'connected' ? 'Connected' : ai.status === 'unverified' ? 'Key saved (untested)' : ai.status === 'missing' ? 'Not configured' : 'Needs attention'}</div></div>
                    <div><div className="text-xs text-muted">Capabilities</div><div className="text-ink">{current?.capabilities.join(', ') ?? 'Text generation'}</div></div>
                    <div><div className="text-xs text-muted">Last success</div><div className="text-ink">{lastSuccess?.lastSuccess ? formatDate(lastSuccess.lastSuccess) : '—'}</div></div>
                    <div><div className="text-xs text-muted">Average response</div><div className="text-ink">{current && health[current.id]?.avgMs ? `${health[current.id].avgMs} ms` : '—'}</div></div>
                  </div>
                  <p className="text-xs text-muted mt-3">{ai.message}</p>
                  {ai.detail && <p className="text-[11px] text-faint mt-1 break-words">{ai.detail}</p>}
                </Card>

                <Card>
                  <h2 className="font-semibold text-ink mb-2">What is an API key?</h2>
                  <p className="text-sm text-muted leading-relaxed">
                    An API key is like a password that lets Studifree talk to Google Gemini on your behalf. You create it
                    in your own Google account. Google may apply quotas or charges. Studifree itself is free.
                  </p>
                  <p className="text-sm text-muted mt-2">
                    Your key is stored in this browser only. Anyone with access to this browser profile can read it. Do not use on a shared device.
                  </p>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-sm text-ink underline inline-flex items-center gap-1 mt-3">
                    Get a Gemini API key from Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Card>

                <Card>
                  <h2 className="font-semibold text-ink mb-3">API key</h2>
                  <Input label="Gemini API key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste your key" hint="Use the official Google AI Studio key. Never share it." />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button onClick={saveKey} disabled={busy === 'save'}>
                      {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Save key
                    </Button>
                    <Button variant="secondary" onClick={refreshModels} disabled={busy === 'refresh'}>
                      {busy === 'refresh' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh models
                    </Button>
                    <Button variant="ghost" onClick={removeKey}><Trash2 className="w-4 h-4" /> Remove key</Button>
                  </div>
                  {message && <p className="text-sm text-muted mt-3">{message}</p>}
                  {error && <p className="text-sm text-ink mt-3">{error}</p>}
                  {lastError && <p className="text-xs text-faint mt-2">Discovery error: {lastError}</p>}
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-ink">Automatic model switching</h2>
                      <p className="text-sm text-muted">Use a compatible fallback when the preferred model fails.</p>
                    </div>
                    <Switch checked={policy.autoFailover} onChange={(v) => fallbackManager.setAutoFailover(v)} />
                  </div>
                  <p className="text-xs text-faint mt-3">
                    Retries and fallback requests can consume additional API quota. Switching models does not necessarily
                    move you to a separate quota pool or avoid charges.
                  </p>
                </Card>
              </div>
            )}

            {active === 'models' && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-semibold text-ink">Model discovery</h2>
                      <p className="text-xs text-muted">
                        {models.length} discovered · {lastRefresh ? `Last refreshed ${new Date(lastRefresh).toLocaleString()}` : 'Never refreshed'}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={refreshModels} disabled={busy === 'refresh'}>
                      {busy === 'refresh' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-faint absolute left-3 top-1/2 -translate-y-1/2" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models..." className="w-full pl-9 pr-3 py-2 rounded-xl bg-inset border border-line text-ink" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'advanced-reasoning', 'general', 'fast', 'image', 'audio', 'embedding'] as const).map((c) => (
                      <button key={c} onClick={() => setCat(c as any)} className={`px-2.5 py-1 rounded-lg text-xs border ${cat === c ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-muted border-line'}`}>
                        {c === 'all' ? 'All' : categoryLabels[c as ModelCategory]}
                      </button>
                    ))}
                  </div>
                </Card>

                {filtered.length === 0 ? (
                  <EmptyState title="No models found" description={models.length ? 'Try a different search or category.' : 'Save your key and press Refresh models.'} />
                ) : (
                  <div className="space-y-2">
                    {filtered.map((m) => {
                      const CatIcon = categoryIcons[m.category]
                      const h = health[m.id]
                      return (
                        <Card key={m.id} padded={false} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0"><CatIcon className="w-4 h-4 text-ink" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-ink">{m.displayName}</span>
                                {settings.ai?.model === m.id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-ink">Current</span>}
                                {m.deprecated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-inset text-faint">Deprecated</span>}
                              </div>
                              <p className="text-xs text-muted break-all">{m.id}</p>
                              <p className="text-[11px] text-faint mt-0.5">{categoryLabels[m.category]} · {m.capabilities.join(', ')}</p>
                              {h && <p className="text-[11px] text-faint mt-0.5">{h.successCount} success · {h.failureCount} failure{h.avgMs ? ` · ${h.avgMs} ms` : ''}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button size="sm" variant={settings.ai?.model === m.id ? 'primary' : 'secondary'} onClick={() => chooseModel(m)}>Select</Button>
                              <Button size="sm" variant="ghost" onClick={() => testModel(m.id)} disabled={busy === m.id}>
                                {busy === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                              </Button>
                              {testResults[m.id] && (
                                <span className="text-[10px] text-faint text-center">{testResults[m.id].ok ? <Check className="w-3 h-3 inline" /> : <X className="w-3 h-3 inline" />} {testResults[m.id].ms}ms</span>
                              )}
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
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="font-semibold text-ink">Text-learning fallback chain</h2>
                      <p className="text-xs text-muted">Drag to reorder, or use the arrows. The first available model is tried first.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => fallbackManager.restoreDefaults()}><RotateCcw className="w-4 h-4" /> Restore</Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-line">
                    <span className="text-sm text-ink">Automatic switching</span>
                    <Switch checked={policy.autoFailover} onChange={(v) => fallbackManager.setAutoFailover(v)} />
                  </div>
                  {chain.length === 0 ? (
                    <EmptyState title="No chain yet" description="Refresh models or let Studifree use the conservative defaults." />
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
                            className={`flex items-center gap-2 p-2.5 rounded-xl border ${disabled ? 'opacity-50 bg-inset border-line' : 'bg-surface border-line'}`}
                          >
                            <GripVertical className="w-4 h-4 text-faint cursor-grab" />
                            <span className="text-xs text-faint w-4">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-ink truncate">{m?.displayName ?? id}</div>
                              <div className="text-[10px] text-faint truncate">{id}</div>
                            </div>
                            <button onClick={() => move(id, -1)} className="p-1 rounded hover:bg-accent-soft text-muted" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => move(id, 1)} className="p-1 rounded hover:bg-accent-soft text-muted" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                            <Switch checked={!disabled} onChange={() => fallbackManager.toggleDisabled(id)} />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
                <Card>
                  <h2 className="font-semibold text-ink mb-2">Separate chains</h2>
                  <p className="text-sm text-muted">Image, audio, transcription, TTS and embedding tasks use their own compatible models and never enter the text chain.</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted">
                    <div className="p-2 rounded-xl bg-inset">Image generation · {fallbackManager.buildChain('image-generate').length} models</div>
                    <div className="p-2 rounded-xl bg-inset">Audio · {fallbackManager.buildChain('transcription').length} models</div>
                    <div className="p-2 rounded-xl bg-inset">Embeddings · {fallbackManager.buildChain('embedding').length} models</div>
                    <div className="p-2 rounded-xl bg-inset">Vision · {fallbackManager.buildChain('image-understand').length} models</div>
                  </div>
                </Card>
              </div>
            )}

            {active === 'testing' && (
              <div className="space-y-4">
                <Card>
                  <h2 className="font-semibold text-ink mb-2">Test connection</h2>
                  <p className="text-sm text-muted mb-3">Runs a tiny generation request against the selected model.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => testModel(selectedModel)} disabled={!!busy}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Test text generation
                    </Button>
                    <Button variant="secondary" onClick={refreshModels} disabled={busy === 'refresh'}><RefreshCw className="w-4 h-4" /> Test model availability</Button>
                  </div>
                  {testResults[selectedModel] && (
                    <p className="text-sm text-muted mt-3">
                      {testResults[selectedModel].ok ? 'Success' : 'Failed'} in {testResults[selectedModel].ms} ms.
                      {testResults[selectedModel].error ? ` ${testResults[selectedModel].error}` : ''}
                    </p>
                  )}
                </Card>
                <Card>
                  <h2 className="font-semibold text-ink mb-2">Capability notes</h2>
                  <p className="text-sm text-muted">Image, audio and embedding models are only shown or used for their own task. Studifree never sends text-learning prompts to a model that does not support text generation.</p>
                </Card>
              </div>
            )}

            {active === 'errors' && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-ink">Recent model activity</h2>
                    <Button variant="ghost" size="sm" onClick={() => useAiEventsStore.getState().clearErrors()}>Clear</Button>
                  </div>
                  {errors.length === 0 ? (
                    <EmptyState title="No errors yet" description="Model failures and recoveries will appear here." />
                  ) : (
                    <ul className="space-y-2">
                      {errors.map((e) => (
                        <li key={e.id} className="p-3 rounded-xl border border-line">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted">{new Date(e.timestamp).toLocaleString()}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-inset text-faint">{e.code}</span>
                          </div>
                          <p className="text-sm text-ink mt-1">{e.model}</p>
                          <p className="text-xs text-muted">{e.description}</p>
                          <p className="text-xs text-faint mt-1">Recovery: {e.recovery}{e.switchedTo ? ` → ${e.switchedTo}` : ''} · {e.fallbackSucceeded ? 'fallback succeeded' : 'not recovered'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                {switches.length > 0 && (
                  <Card>
                    <h2 className="font-semibold text-ink mb-2">Successful switches</h2>
                    <ul className="space-y-1 text-sm text-muted">
                      {switches.slice(0, 10).map((s, i) => (
                        <li key={i}>{new Date(s.timestamp).toLocaleTimeString()} · {s.fromModel} → {s.toModel} ({s.reason})</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </Tabs>

      <Card>
        <h2 className="font-semibold text-ink mb-2">Help</h2>
        <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noreferrer" className="text-sm text-ink underline inline-flex items-center gap-1">
          Official Gemini model documentation <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <p className="text-xs text-faint mt-2">Model IDs are discovered from your account. Studifree never invents model IDs.</p>
      </Card>
    </div>
  )
}
