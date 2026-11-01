import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Layers, RotateCcw, Check, X, Trash2, Edit3, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Textarea } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { Dialog } from '../components/UI/Dialog'
import { HelpCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'
import { uid } from '../utils/id'
import { generateCards } from '../services/gemini/generate'
import { AiRequired } from '../components/AI/NoApiKeyPrompt'
import { isNoApiKeyError } from '../services/ai/requestManager'
import type { Deck, Flashcard } from '../types'

const SR_DEFAULT = { ease: 2.5, interval: 0, repetitions: 0 }

function nextSR(card: Flashcard, quality: number) {
  // quality 0-5
  let ease = card.ease
  let interval = card.interval
  let reps = card.repetitions
  if (quality < 3) {
    reps = 0
    interval = 1
  } else {
    reps += 1
    if (reps === 1) interval = 1
    else if (reps === 2) interval = 6
    else interval = Math.round(interval * ease)
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (ease < 1.3) ease = 1.3
  }
  const due = Date.now() + interval * 86400000
  return { ease, interval, repetitions: reps, due, confidence: quality, lapses: quality < 3 ? card.lapses + 1 : card.lapses }
}

export default function Flashcards() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [decks, setDecks] = useState<Deck[]>([])
  const [activeDeck, setActiveDeck] = useState<string | null>(params.get('deck'))
  const [cards, setCards] = useState<Flashcard[]>([])
  const [studyIndex, setStudyIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState<'list' | 'study' | 'create'>('list')
  const [newDeckName, setNewDeckName] = useState('')
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  const [genTopic, setGenTopic] = useState(params.get('topic') ?? '')
  const [genCount, setGenCount] = useState(10)
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [createDeckOpen, setCreateDeckOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)

  const loadDecks = async () => {
    const all = await db.decks.orderBy('updatedAt').reverse().toArray()
    setDecks(all)
  }
  useEffect(() => { loadDecks() }, [])

  const openDeck = async (id: string) => {
    setActiveDeck(id)
    const cs = await db.cards.where('deckId').equals(id).toArray()
    setCards(cs)
    setStudyIndex(0)
    setFlipped(false)
    setMode('study')
  }

  useEffect(() => {
    const d = params.get('deck')
    if (d) openDeck(d)
  }, [params])

  const createDeck = async () => {
    if (!newDeckName.trim()) return
    const now = Date.now()
    const deck: Deck = { id: uid('deck'), name: newDeckName.trim(), tags: [], createdAt: now, updatedAt: now }
    await db.decks.add(deck)
    setNewDeckName('')
    setCreateDeckOpen(false)
    loadDecks()
    setSelectedDeckId(deck.id)
  }

  const addManualCard = async () => {
    if (!selectedDeckId || !newCard.front.trim() || !newCard.back.trim()) return
    const now = Date.now()
    const card: Flashcard = {
      id: uid('card'), deckId: selectedDeckId, front: newCard.front.trim(), back: newCard.back.trim(), tags: [],
      createdAt: now, ease: SR_DEFAULT.ease, interval: 0, repetitions: 0, due: now, confidence: 0, lapses: 0,
    }
    await db.cards.add(card)
    setNewCard({ front: '', back: '' })
    if (activeDeck === selectedDeckId) {
      const cs = await db.cards.where('deckId').equals(selectedDeckId).toArray()
      setCards(cs)
    }
  }

  const generate = async () => {
    const apiKey = settings.ai?.apiKey
    if (!apiKey) { setGenError('Add your Gemini API key in AI Setup to generate flashcards.'); return }
    if (!genTopic.trim()) { setGenError('Enter a topic.'); return }
    if (!selectedDeckId) { setGenError('Create or select a deck first.'); return }
    setGenLoading(true); setGenError(null)
    try {
      const gen = await generateCards({ apiKey, topic: genTopic.trim(), count: genCount, difficulty: 'mixed' })
      const now = Date.now()
      const newCards: Flashcard[] = gen.map((g) => ({
        id: uid('card'), deckId: selectedDeckId, front: g.front, back: g.back, tags: [], createdAt: now,
        ease: 2.5, interval: 0, repetitions: 0, due: now, confidence: 0, lapses: 0,
        // store explanation in back? append
      }))
      // append explanation to back if present
      gen.forEach((g, i) => { if (g.explanation) newCards[i].back = newCards[i].back + '\n\n' + g.explanation })
      await db.cards.bulkAdd(newCards)
      const cs = await db.cards.where('deckId').equals(selectedDeckId).toArray()
      setCards(cs)
      setGenTopic('')
    } catch (e: any) {
      setGenError(isNoApiKeyError(e) ? 'Add your Gemini API key in AI Setup to generate flashcards.' : e?.message ?? String(e))
    } finally {
      setGenLoading(false)
    }
  }

  const deleteDeck = async (id: string) => {
    if (!confirm('Delete deck and all its cards?')) return
    await db.decks.delete(id)
    await db.cards.where('deckId').equals(id).delete()
    loadDecks()
    if (activeDeck === id) { setActiveDeck(null); setMode('list') }
  }

  const dueCards = cards.filter((c) => c.due <= Date.now())
  const studyList = dueCards.length ? dueCards : cards

  const rate = async (quality: number) => {
    const card = studyList[studyIndex]
    if (!card) return
    const updated = { ...card, ...nextSR(card, quality), lastReviewed: Date.now() }
    await db.cards.put(updated)
    setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)))
    setFlipped(false)
    setStudyIndex((i) => {
      const next = i + 1
      if (next >= studyList.length) return 0
      return next
    })
  }

  // LIST MODE
  if (mode === 'list') {
    return (
      <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">Flashcards</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}><HelpCircle className="w-4 h-4" /> Help</Button>
            <Button onClick={() => setCreateDeckOpen(true)}><Plus className="w-4 h-4" /> New deck</Button>
          </div>
        </div>

        <AiRequired feature="AI flashcard generation">
        <Card>
          <h2 className="font-semibold text-ink mb-3">Generate with AI</h2>
          <div className="space-y-3">
            <Input label="Topic" value={genTopic} onChange={(e) => setGenTopic(e.target.value)} placeholder="Topic for flashcards" />
            <div>
              <label className="block text-sm text-muted mb-1.5">Deck</label>
              <select value={selectedDeckId ?? ''} onChange={(e) => setSelectedDeckId(e.target.value || null)} className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink">
                <option value="">Select deck</option>
                {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Input label="Count" type="number" value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} />
            <Button onClick={generate} disabled={genLoading}>
              {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
            </Button>
            {genError && <p className="text-sm text-ink">{genError}</p>}
          </div>
        </Card>
        </AiRequired>

        <Card>
          <h2 className="font-semibold text-ink mb-3">Add card manually</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-muted mb-1.5">Deck</label>
              <select value={selectedDeckId ?? ''} onChange={(e) => setSelectedDeckId(e.target.value || null)} className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink">
                <option value="">Select deck</option>
                {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Input placeholder="Front (question)" value={newCard.front} onChange={(e) => setNewCard({ ...newCard, front: e.target.value })} />
            <Textarea placeholder="Back (answer)" value={newCard.back} onChange={(e) => setNewCard({ ...newCard, back: e.target.value })} />
            <Button onClick={addManualCard}>Add card</Button>
          </div>
        </Card>

        {decks.length === 0 ? (
          <EmptyState icon={Layers} title="No decks yet" description="Create a deck to start." />
        ) : (
          <ul className="space-y-2">
            {decks.map((d) => (
              <li key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line">
                <Layers className="w-5 h-5 text-muted" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{d.name}</div>
                  <div className="text-xs text-muted">{d.tags.join(', ') || 'No tags'}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => openDeck(d.id)}>Study</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteDeck(d.id)}><Trash2 className="w-4 h-4" /></Button>
              </li>
            ))}
          </ul>
        )}

        <Dialog open={createDeckOpen} onClose={() => setCreateDeckOpen(false)} title="New deck">
          <div className="space-y-3">
            <Input label="Deck name" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} />
            <Button onClick={createDeck} className="w-full">Create</Button>
          </div>
        </Dialog>
        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Flashcards help">
          <div className="space-y-2 text-sm text-muted">
            <p><strong className="text-ink">What it does:</strong> Create decks and review cards with spaced repetition.</p>
            <p><strong className="text-ink">How to use:</strong> Create a deck, add cards manually or generate with AI, then Study. Rate each card to schedule reviews.</p>
            <p><strong className="text-ink">If it fails:</strong> Check API key for generation.</p>
          </div>
        </Dialog>
      </div>
    )
  }

  // STUDY MODE
  const card = studyList[studyIndex]
  if (!card) {
    return (
      <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => { setMode('list'); setActiveDeck(null) }}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <EmptyState title="No cards to review" description="All caught up, or add cards to this deck." />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => { setMode('list'); setActiveDeck(null) }}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <span className="text-sm text-muted">{studyIndex + 1} / {studyList.length}</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[260px] flex items-center justify-center p-8 rounded-3xl bg-surface border border-line shadow-card text-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? 'back' : 'front'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <p className="text-xs text-muted mb-3">{flipped ? 'Answer' : 'Question'}</p>
            <p className="text-lg text-ink whitespace-pre-wrap">{flipped ? card.back : card.front}</p>
            <p className="text-xs text-faint mt-6">Tap to flip</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {flipped && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="secondary" onClick={() => rate(1)}><X className="w-4 h-4" /> Again</Button>
          <Button variant="secondary" onClick={() => rate(3)}>Hard</Button>
          <Button variant="secondary" onClick={() => rate(4)}>Good</Button>
          <Button onClick={() => rate(5)}><Check className="w-4 h-4" /> Easy</Button>
        </div>
      )}
      {!flipped && (
        <div className="flex justify-center">
          <Button onClick={() => setFlipped(true)}><RotateCcw className="w-4 h-4" /> Show answer</Button>
        </div>
      )}
    </div>
  )
}
