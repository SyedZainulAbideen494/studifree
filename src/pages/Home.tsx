import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Layers, ClipboardCheck, FlaskConical, ArrowRight, Flame, Target, Clock, Plus } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'
import type { Lesson } from '../types'
import { todayKey } from '../utils/format'

export default function Home() {
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [recent, setRecent] = useState<Lesson[]>([])
  const [topic, setTopic] = useState('')
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    db.lessons.orderBy('updatedAt').reverse().limit(5).toArray().then(setRecent)
    db.cards.where('due').belowOrEqual(Date.now()).count().then(setDueCount)
  }, [])

  const startLearn = () => {
    if (topic.trim()) {
      navigate(`/learn?topic=${encodeURIComponent(topic.trim())}`)
    } else {
      navigate('/learn')
    }
  }

  const newToApp = !settings.onboardingDone

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto">
      {newToApp && (
        <Card glass className="mb-6 border-accent/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-ink mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-ink mb-1">New here? Start with a guided tour.</h2>
              <p className="text-sm text-muted mb-3">Learn how to use Studifree in under two minutes.</p>
              <Button size="sm" onClick={() => navigate('/onboarding')}>Start tour</Button>
            </div>
          </div>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-semibold text-ink tracking-tight">Welcome to Studifree.</h1>
        <p className="text-muted mt-2 text-lg">Learn anything. Understand everything.</p>
      </motion.div>

      <Card className="mb-6">
        <label className="block text-sm text-muted mb-2">What would you like to learn today?</label>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startLearn()}
            placeholder="e.g. Photosynthesis, Newton's laws, Spanish verbs..."
            className="flex-1 px-4 py-3 rounded-2xl bg-inset border border-line text-ink placeholder:text-faint focus:outline-none focus:border-line-strong"
          />
          <Button onClick={startLearn}>Learn</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/learn?mode=pdf')}><Plus className="w-4 h-4" /> Upload PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/learn?mode=image')}><Plus className="w-4 h-4" /> Upload image</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/learn')}>Open lesson</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Explain something', icon: BookOpen, to: '/learn' },
          { label: 'Create flashcards', icon: Layers, to: '/flashcards' },
          { label: 'Generate a quiz', icon: ClipboardCheck, to: '/quiz' },
          { label: 'Open Interactive Lab', icon: FlaskConical, to: '/lab' },
        ].map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.to)}
            className="p-4 rounded-2xl bg-surface border border-line text-left hover:bg-elevated transition"
          >
            <q.icon className="w-5 h-5 text-ink mb-2" />
            <span className="text-sm font-medium text-ink">{q.label}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-1 text-muted"><Flame className="w-4 h-4" /> Learning streak</div>
          <div className="text-2xl font-semibold text-ink">0 days</div>
          <p className="text-xs text-faint mt-1">Start today to build your streak.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1 text-muted"><Target className="w-4 h-4" /> Today's goal</div>
          <div className="text-2xl font-semibold text-ink">{settings.studyGoalMinutes} min</div>
          <p className="text-xs text-faint mt-1">Adjust in Settings.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1 text-muted"><Clock className="w-4 h-4" /> Upcoming reviews</div>
          <div className="text-2xl font-semibold text-ink">{dueCount}</div>
          <p className="text-xs text-faint mt-1">Flashcards due now.</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Continue learning</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/library')}>View all <ArrowRight className="w-4 h-4" /></Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No lessons yet" description="Start by typing a topic or uploading a document above." />
        ) : (
          <ul className="space-y-2">
            {recent.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => navigate(`/learn?lesson=${l.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent-soft transition text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">{l.title}</div>
                    <div className="text-xs text-muted">{l.style} · {new Date(l.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-faint" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-6 text-center text-xs text-faint">
        Recommended next action: {recent.length === 0 ? 'Create your first lesson.' : 'Review due flashcards.'}
      </div>
    </div>
  )
}
