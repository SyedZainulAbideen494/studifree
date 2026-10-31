import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, Sparkles, Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { Switch } from '../components/UI/Switch'
import { SparkleToggle } from '../components/Effects/SparkleToggle'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'

export default function Settings() {
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const setTheme = useAppStore((s) => s.setTheme)
  const toggleEffects = useAppStore((s) => s.toggleEffects)
  const [work, setWork] = useState(settings.pomodoroWork)
  const [brk, setBrk] = useState(settings.pomodoroBreak)
  const [goal, setGoal] = useState(settings.studyGoalMinutes)

  const exportData = async () => {
    const data = {
      settings,
      lessons: await db.lessons.toArray(),
      decks: await db.decks.toArray(),
      cards: await db.cards.toArray(),
      quizzes: await db.quizzes.toArray(),
      quizResults: await db.quizResults.toArray(),
      concepts: await db.concepts.toArray(),
      sessions: await db.sessions.toArray(),
      planner: await db.planner.toArray(),
      goals: await db.goals.toArray(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'studifree-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.lessons) await db.lessons.bulkPut(data.lessons)
      if (data.decks) await db.decks.bulkPut(data.decks)
      if (data.cards) await db.cards.bulkPut(data.cards)
      if (data.quizzes) await db.quizzes.bulkPut(data.quizzes)
      if (data.quizResults) await db.quizResults.bulkPut(data.quizResults)
      if (data.concepts) await db.concepts.bulkPut(data.concepts)
      if (data.sessions) await db.sessions.bulkPut(data.sessions)
      if (data.planner) await db.planner.bulkPut(data.planner)
      if (data.goals) await db.goals.bulkPut(data.goals)
      if (data.settings) update(data.settings)
      alert('Import complete.')
    } catch (e: any) {
      alert('Import failed: ' + (e?.message ?? e))
    }
  }

  const clearAll = async () => {
    if (!confirm('Delete ALL local data? This cannot be undone.')) return
    await db.delete()
    localStorage.clear()
    location.reload()
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Theme</h2>
        <div className="flex gap-2">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 ${settings.theme === t ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-muted border-line'}`}>
              {t === 'dark' && <Moon className="w-4 h-4" />}
              {t === 'light' && <Sun className="w-4 h-4" />}
              {t === 'system' && <Monitor className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Effects</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink">Ambient effects</span>
          <SparkleToggle checked={settings.effectsEnabled} onChange={toggleEffects} label="Toggle effects" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">Reduced motion</span>
          <Switch checked={settings.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Pomodoro durations</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Work (min)" type="number" value={work} onChange={(e) => setWork(Number(e.target.value))} />
          <Input label="Break (min)" type="number" value={brk} onChange={(e) => setBrk(Number(e.target.value))} />
        </div>
        <Button className="mt-3" onClick={() => update({ pomodoroWork: work, pomodoroBreak: brk })}>Save</Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Study goal</h2>
        <div className="flex gap-2">
          <Input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
          <Button onClick={() => update({ studyGoalMinutes: goal })}>Save</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">AI</h2>
        <Button onClick={() => navigate('/ai-setup')}>Open AI Setup</Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Onboarding</h2>
        <Button variant="secondary" onClick={() => { update({ onboardingDone: false }); navigate('/onboarding') }}>
          <RotateCcw className="w-4 h-4" /> Replay onboarding
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Data</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData}><Download className="w-4 h-4" /> Export data</Button>
          <label className="inline-flex">
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f) }} />
            <Button variant="secondary"><Upload className="w-4 h-4" /> Import data</Button>
          </label>
          <Button variant="danger" onClick={clearAll}><Trash2 className="w-4 h-4" /> Clear all data</Button>
        </div>
      </Card>
    </div>
  )
}
