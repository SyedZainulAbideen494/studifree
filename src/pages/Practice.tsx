import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, ClipboardCheck, ArrowRight } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Card } from '../components/UI/Card'

export default function Practice() {
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Practice</h1>
      <p className="text-muted">Choose how you want to practise today.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <Layers className="w-6 h-6 text-ink mb-3" />
          <h2 className="font-semibold text-ink mb-1">Flashcards</h2>
          <p className="text-sm text-muted mb-4">Spaced repetition review for long-term memory.</p>
          <Button onClick={() => navigate('/flashcards')} className="w-full">Open flashcards <ArrowRight className="w-4 h-4" /></Button>
        </Card>
        <Card>
          <ClipboardCheck className="w-6 h-6 text-ink mb-3" />
          <h2 className="font-semibold text-ink mb-1">Quiz Studio</h2>
          <p className="text-sm text-muted mb-4">Generate and take quizzes on any topic.</p>
          <Button onClick={() => navigate('/quiz')} className="w-full">Open quiz studio <ArrowRight className="w-4 h-4" /></Button>
        </Card>
      </div>
    </div>
  )
}
