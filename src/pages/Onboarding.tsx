import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, Brain, Target, ChevronRight, Check } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { useAppStore } from '../store/useAppStore'

const steps = [
  {
    title: 'Welcome to Studifree',
    body: 'Make learning simple, accessible and free for everyone. No account needed. Your data stays on your device.',
    icon: Sparkles,
  },
  {
    title: 'Learn anything',
    body: 'Type a topic, upload a PDF or image, and get clear explanations, examples and flashcards.',
    icon: BookOpen,
  },
  {
    title: 'Practise and remember',
    body: 'Quizzes, flashcards with spaced repetition, and an adaptive engine that finds your gaps.',
    icon: Brain,
  },
  {
    title: 'You are in control',
    body: 'Use your own AI key, or skip AI entirely and use manual tools. Export your data anytime.',
    icon: Target,
  },
]

export default function Onboarding() {
  const [i, setI] = useState(0)
  const navigate = useNavigate()
  const update = useAppStore((s) => s.updateSettings)
  const step = steps[i]
  const Icon = step.icon
  const finish = () => {
    update({ onboardingDone: true })
    navigate('/')
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-accent-soft flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-ink" />
            </div>
            <h1 className="text-2xl font-semibold text-ink mb-3">{step.title}</h1>
            <p className="text-muted leading-relaxed mb-8">{step.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-accent' : 'w-2 bg-line-strong'}`} />
          ))}
        </div>
        <div className="flex gap-3">
          {i > 0 && (
            <Button variant="secondary" onClick={() => setI(i - 1)} className="flex-1">Back</Button>
          )}
          {i < steps.length - 1 ? (
            <Button onClick={() => setI(i + 1)} className="flex-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="flex-1">
              Get started <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
        <button onClick={finish} className="mt-4 w-full text-sm text-muted hover:text-ink">Skip</button>
      </div>
    </div>
  )
}
