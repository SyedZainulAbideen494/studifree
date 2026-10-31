import React, { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Plus, Check, Trash2, Timer } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { Progress } from '../components/UI/Progress'
import { db } from '../db'
import { uid } from '../utils/id'
import { useAppStore } from '../store/useAppStore'
import type { PlannerItem } from '../types'

function usePomodoro() {
  const settings = useAppStore((s) => s.settings)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [running, setRunning] = useState(false)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(settings.pomodoroWork * 60)
  const intervalRef = useRef<any>(null)

  const total = (mode === 'work' ? settings.pomodoroWork : settings.pomodoroBreak) * 60

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      if (!endAt) return
      const r = Math.max(0, Math.round((endAt - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) {
        setRunning(false)
        setEndAt(null)
        setRemaining(total)
        // log session
        if (mode === 'work') {
          db.sessions.add({ id: uid('session'), startedAt: endAt! - total * 1000, endedAt: Date.now(), minutes: settings.pomodoroWork })
        }
      }
    }, 500)
    return () => clearInterval(intervalRef.current)
  }, [running, endAt, mode, total, settings.pomodoroWork])

  const start = () => {
    const t = remaining > 0 ? remaining : total
    setEndAt(Date.now() + t * 1000)
    setRunning(true)
  }
  const pause = () => { setRunning(false); if (endAt) setRemaining(Math.max(0, Math.round((endAt - Date.now()) / 1000))) }
  const reset = () => { setRunning(false); setEndAt(null); setRemaining(total) }
  const switchMode = (m: 'work' | 'break') => { setMode(m); setRunning(false); setEndAt(null); setRemaining((m === 'work' ? settings.pomodoroWork : settings.pomodoroBreak) * 60) }

  return { mode, running, remaining, total, start, pause, reset, switchMode }
}

export default function Planner() {
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const [items, setItems] = useState<PlannerItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [goalMinutes, setGoalMinutes] = useState(settings.studyGoalMinutes)
  const timer = usePomodoro()

  const load = async () => {
    const all = await db.planner.orderBy('due').toArray()
    setItems(all)
  }
  useEffect(() => { load() }, [])

  const addItem = async () => {
    if (!newTitle.trim()) return
    await db.planner.add({ id: uid('plan'), title: newTitle.trim(), due: Date.now() + 86400000, done: false, type: 'goal', createdAt: Date.now() })
    setNewTitle('')
    load()
  }
  const toggle = async (item: PlannerItem) => {
    await db.planner.update(item.id, { done: !item.done })
    load()
  }
  const remove = async (id: string) => {
    await db.planner.delete(id)
    load()
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Planner & Focus</h1>

      <Card>
        <div className="flex items-center gap-2 mb-3"><Timer className="w-5 h-5 text-ink" /><h2 className="font-semibold text-ink">Pomodoro timer</h2></div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => timer.switchMode('work')} className={`px-3 py-1.5 rounded-xl text-sm ${timer.mode === 'work' ? 'bg-accent text-accent-ink' : 'bg-surface text-muted border border-line'}`}>Work</button>
          <button onClick={() => timer.switchMode('break')} className={`px-3 py-1.5 rounded-xl text-sm ${timer.mode === 'break' ? 'bg-accent text-accent-ink' : 'bg-surface text-muted border border-line'}`}>Break</button>
        </div>
        <div className="text-5xl font-semibold text-ink text-center my-4 tabular-nums">{fmt(timer.remaining)}</div>
        <Progress value={timer.total - timer.remaining} max={timer.total} className="mb-4" />
        <div className="flex gap-2 justify-center">
          {!timer.running ? (
            <Button onClick={timer.start}><Play className="w-4 h-4" /> Start</Button>
          ) : (
            <Button onClick={timer.pause}><Pause className="w-4 h-4" /> Pause</Button>
          )}
          <Button variant="secondary" onClick={timer.reset}><RotateCcw className="w-4 h-4" /> Reset</Button>
        </div>
        <p className="text-xs text-faint text-center mt-3">Timer uses timestamps; resilient to tab switching. Background execution on iOS is not guaranteed.</p>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Daily study goal</h2>
        <div className="flex gap-2">
          <Input type="number" value={goalMinutes} onChange={(e) => setGoalMinutes(Number(e.target.value))} />
          <Button onClick={() => update({ studyGoalMinutes: goalMinutes })}>Save</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Planner items</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add a task..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
          <Button onClick={addItem}><Plus className="w-4 h-4" /></Button>
        </div>
        {items.length === 0 ? (
          <EmptyState title="No tasks yet" description="Add study tasks to stay organised." />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent-soft">
                <button onClick={() => toggle(item)} className={`w-5 h-5 rounded-md border flex items-center justify-center ${item.done ? 'bg-accent border-accent text-accent-ink' : 'border-line'}`}>
                  {item.done && <Check className="w-3.5 h-3.5" />}
                </button>
                <span className={`flex-1 text-sm ${item.done ? 'line-through text-muted' : 'text-ink'}`}>{item.title}</span>
                <Button variant="ghost" size="sm" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
