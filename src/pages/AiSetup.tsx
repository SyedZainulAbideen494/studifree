import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, ShieldCheck, ExternalLink, CheckCircle2, XCircle, Loader2, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { modelManager } from '../services/gemini/modelManager'

export default function AiSetup() {
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const [apiKey, setApiKey] = useState(settings.ai?.apiKey ?? '')
  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState(settings.ai?.model ?? 'gemini-2.5-flash')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [discovering, setDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (settings.ai?.apiKey) {
      modelManager.setApiKey(settings.ai.apiKey)
      setModels(modelManager.getModels())
    }
  }, [])

  const saveKey = () => {
    if (!apiKey.trim()) { setError('Please enter an API key.'); return }
    const cfg = { provider: 'gemini' as const, apiKey: apiKey.trim(), model: selectedModel, fallbackModel: 'gemini-2.5-flash-lite' }
    update({ ai: cfg })
    modelManager.setApiKey(apiKey.trim())
    setError(null)
    setTestResult('Key saved. Test the connection to verify.')
  }

  const removeKey = () => {
    update({ ai: undefined })
    setApiKey('')
    setModels([])
    setTestResult(null)
    setError(null)
  }

  const testConnection = async () => {
    if (!apiKey.trim()) { setError('Enter an API key first.'); return }
    setTesting(true); setError(null); setTestResult(null)
    modelManager.setApiKey(apiKey.trim())
    try {
      const r = await modelManager.testModel(selectedModel)
      if (r.ok) setTestResult(`Connected successfully in ${r.ms} ms.`)
      else setTestResult(`Failed: ${r.error ?? 'unknown error'}`)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setTesting(false)
    }
  }

  const discover = async () => {
    if (!apiKey.trim()) { setError('Enter an API key first.'); return }
    setDiscovering(true); setError(null)
    modelManager.setApiKey(apiKey.trim())
    try {
      const ms = await modelManager.discover(true)
      setModels(ms)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setDiscovering(false)
    }
  }

  const saveModel = () => {
    if (!settings.ai) { setError('Save an API key first.'); return }
    update({ ai: { ...settings.ai, model: selectedModel } })
    setTestResult('Model updated.')
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">AI Setup</h1>
        <p className="text-muted mt-1">Connect your own AI provider. Studifree does not host AI; you bring the key.</p>
      </div>

      <Card>
        <h2 className="font-semibold text-ink mb-2">What is an API key?</h2>
        <p className="text-sm text-muted leading-relaxed">
          An API key is like a password that lets Studifree talk to an AI service on your behalf. You create it in your AI provider's account.
          Provider charges, quotas and terms may apply. Studifree is free; the AI provider is not necessarily free.
        </p>
        <p className="text-sm text-muted mt-2">
          Your key is stored in this browser only. Anyone with access to this browser profile can read it. Do not use on a shared device.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Provider</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-2 rounded-xl bg-accent text-accent-ink text-sm font-medium">Google Gemini</div>
          <span className="text-xs text-muted">More providers coming.</span>
        </div>
        <div className="space-y-3">
          <Input
            label="API key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Gemini API key"
            hint="Get one from Google AI Studio."
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveKey}>Save key</Button>
            <Button variant="secondary" onClick={testConnection} disabled={testing}>
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Test connection
            </Button>
            <Button variant="ghost" onClick={removeKey}><Trash2 className="w-4 h-4" /> Remove key</Button>
          </div>
          {testResult && <p className="text-sm text-muted">{testResult}</p>}
          {error && <p className="text-sm text-ink">{error}</p>}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Model</h2>
          <Button variant="secondary" size="sm" onClick={discover} disabled={discovering}>
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Discover models
          </Button>
        </div>
        {models.length === 0 ? (
          <EmptyState title="No models loaded" description="Save an API key and discover models, or pick a recommended model." />
        ) : (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink"
          >
            {models.map((m: any) => (
              <option key={m.id} value={m.id}>{m.displayName || m.id}</option>
            ))}
          </select>
        )}
        <div className="mt-3">
          <label className="block text-sm text-muted mb-1.5">Or recommended model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink"
          >
            {['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'].map((m) => (
              <option key={m} value={m}>{m} (recommended)</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={saveModel}>Save model</Button>
        </div>
        <p className="text-xs text-faint mt-3">
          If a model is temporarily unavailable (503/429), Studifree retries and may switch to a fallback model, then tells you.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-2">Help</h2>
        <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noreferrer" className="text-sm text-ink underline inline-flex items-center gap-1">
          How to get a Gemini API key <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </Card>
    </div>
  )
}
