import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Layers,
  RotateCcw,
  Check,
  X,
  Trash2,
  ArrowLeft,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Textarea } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { Dialog } from '../components/UI/Dialog'
import { HelpCircle } from 'lucide-react'
import {
  AIGenerationModal,
  GenerationErrorModal,
  GenerationStatusIndicator,
  GenerationSuccessModal,
  useDelayedVisibility,
  useGenerationMachine,
  type GenerationPreviewCard,
} from '../components/AI/generation'
import { useAppStore } from '../store/useAppStore'
import { useAiEventsStore } from '../store/useAiEventsStore'
import { db } from '../db'
import { uid } from '../utils/id'
import { generateCards, type GenCard } from '../services/gemini/generate'
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
  return {
    ease,
    interval,
    repetitions: reps,
    due,
    confidence: quality,
    lapses: quality < 3 ? card.lapses + 1 : card.lapses,
  }
}

interface PendingSave {
  deckId: string
  deckName: string
  topic: string
  existingDeck: boolean
  cards: Flashcard[]
}

interface GenerationSuccess {
  deckId: string
  deckTitle: string
  count: number
  source: string
  preview: GenerationPreviewCard[]
}

type Mode = 'list' | 'study' | 'detail'

export default function Flashcards() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [decks, setDecks] = useState<Deck[]>([])
  const [activeDeck, setActiveDeck] = useState<string | null>(params.get('deck'))
  const [activeDeckName, setActiveDeckName] = useState('')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [studyIndex, setStudyIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [newDeckName, setNewDeckName] = useState('')
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  const [genTopic, setGenTopic] = useState(params.get('topic') ?? '')
  const [genCount, setGenCount] = useState(10)
  const [formError, setFormError] = useState<string | null>(null)
  const [createDeckOpen, setCreateDeckOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null)
  const [success, setSuccess] = useState<GenerationSuccess | null>(null)

  const generation = useGenerationMachine('flashcards')
  const waitingVisible = useDelayedVisibility(generation.busy)
  const lastSwitch = useAiEventsStore((s) => s.switches[0])
  const fallbackNote =
    generation.startedAt && lastSwitch && lastSwitch.timestamp >= generation.startedAt
      ? `Studifree switched to ${lastSwitch.toModel} after your preferred model was unavailable.`
      : undefined

  const loadDecks = async () => {
    const all = await db.decks.orderBy('updatedAt').reverse().toArray()
    setDecks(all)
  }
  useEffect(() => {
    loadDecks()
  }, [])

  const openDeck = async (id: string) => {
    setActiveDeck(id)
    const [deck, cs] = await Promise.all([db.decks.get(id), db.cards.where('deckId').equals(id).toArray()])
    setActiveDeckName(deck?.name ?? 'Deck')
    setCards(cs)
    setStudyIndex(0)
    setFlipped(false)
    setMode('study')
  }

  const openDeckDetail = async (id: string) => {
    setActiveDeck(id)
    const [deck, cs] = await Promise.all([db.decks.get(id), db.cards.where('deckId').equals(id).toArray()])
    setActiveDeckName(deck?.name ?? 'Deck')
    setCards(cs)
    setMode('detail')
  }

  useEffect(() => {
    const deckId = params.get('deck')
    if (!deckId) return
    if (params.get('view') === '1') openDeckDetail(deckId)
    else openDeck(deckId)
  }, [params])

  const backToDecks = () => {
    setMode('list')
    setActiveDeck(null)
    navigate('/flashcards')
  }

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
      id: uid('card'),
      deckId: selectedDeckId,
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      tags: [],
      createdAt: now,
      ease: SR_DEFAULT.ease,
      interval: 0,
      repetitions: 0,
      due: now,
      confidence: 0,
      lapses: 0,
    }
    await db.cards.add(card)
    await db.decks.update(selectedDeckId, { updatedAt: now })
    setNewCard({ front: '', back: '' })
    if (activeDeck === selectedDeckId) {
      const cs = await db.cards.where('deckId').equals(selectedDeckId).toArray()
      setCards(cs)
    }
  }

  /**
   * Save the generated cards and read them back. A failure here must never be
   * reported as success: the cards stay in `pendingSave` so they can be retried.
   */
  const persistDeck = async (pending: PendingSave): Promise<Deck> => {
    const now = Date.now()
    await db.transaction('rw', db.decks, db.cards, async () => {
      if (pending.existingDeck) {
        await db.decks.update(pending.deckId, { updatedAt: now })
      } else {
        await db.decks.put({
          id: pending.deckId,
          name: pending.deckName,
          tags: [],
          createdAt: now,
          updatedAt: now,
        })
      }
      await db.cards.bulkPut(pending.cards)
    })

    const savedDeck = await db.decks.get(pending.deckId)
    if (!savedDeck) throw new Error('The deck could not be retrieved after saving.')
    const savedCount = await db.cards.where('deckId').equals(pending.deckId).count()
    if (savedCount < pending.cards.length) {
      throw new Error('Some flashcards could not be verified after saving.')
    }
    return savedDeck
  }

  const celebrate = async (pending: PendingSave, savedDeck: Deck) => {
    await loadDecks()
    setSuccess({
      deckId: savedDeck.id,
      deckTitle: savedDeck.name,
      count: pending.cards.length,
      source: pending.topic,
      preview: pending.cards.slice(0, 3).map((card) => ({ front: card.front, back: card.back })),
    })
    generation.succeed()
  }

  const generate = async () => {
    setFormError(null)
    setPendingSave(null)
    setSuccess(null)

    const apiKey = settings.ai?.apiKey
    if (!apiKey) {
      setFormError('Add your Gemini API key in AI Setup to generate flashcards.')
      return
    }
    if (!genTopic.trim()) {
      setFormError('Enter a topic before generating flashcards.')
      return
    }
    if (!generation.begin('flashcards')) return

    let pending: PendingSave | null = null
    try {
      const generated = await generateCards({
        apiKey,
        topic: genTopic.trim(),
        count: genCount,
        difficulty: 'mixed',
      })

      generation.setStatus('validating')
      const valid = generated.filter(
        (card): card is GenCard => !!card.front?.trim() && !!card.back?.trim(),
      )
      if (!valid.length) {
        throw new Error('The model did not return any usable flashcards. Please try again.')
      }

      const existingDeck = selectedDeckId ? decks.find((deck) => deck.id === selectedDeckId) : undefined
      const deckId = existingDeck?.id ?? uid('deck')
      const deckName = existingDeck?.name ?? genTopic.trim().slice(0, 80)
      const now = Date.now()
      const newCards: Flashcard[] = valid.map((card) => ({
        id: uid('card'),
        deckId,
        front: card.front,
        back: card.explanation ? `${card.back}\n\n${card.explanation}` : card.back,
        tags: [],
        source: genTopic.trim(),
        createdAt: now,
        ease: SR_DEFAULT.ease,
        interval: 0,
        repetitions: 0,
        due: now,
        confidence: 0,
        lapses: 0,
      }))

      pending = {
        deckId,
        deckName,
        topic: genTopic.trim(),
        existingDeck: !!existingDeck,
        cards: newCards,
      }
      setPendingSave(pending)
      generation.setStatus('saving')
      const savedDeck = await persistDeck(pending)
      await celebrate(pending, savedDeck)
      setPendingSave(null)
    } catch (error: any) {
      const message = isNoApiKeyError(error)
        ? 'Add your Gemini API key in AI Setup to generate flashcards.'
        : error?.message ?? String(error)
      generation.fail(message)
    }
  }

  const retrySave = async () => {
    if (!pendingSave) return
    if (!generation.begin('flashcards')) return
    generation.setStatus('saving')
    try {
      const savedDeck = await persistDeck(pendingSave)
      await celebrate(pendingSave, savedDeck)
      setPendingSave(null)
    } catch (error: any) {
      generation.fail(error?.message ?? 'The deck could not be saved. Please try again.')
    }
  }

  const closeSuccess = () => {
    setSuccess(null)
    generation.reset()
  }

  const startLearning = () => {
    if (!success) return
    const deckId = success.deckId
    setSuccess(null)
    generation.reset()
    navigate(`/flashcards?deck=${encodeURIComponent(deckId)}`)
  }

  const viewDeck = () => {
    if (!success) return
    const deckId = success.deckId
    setSuccess(null)
    generation.reset()
    navigate(`/flashcards?deck=${encodeURIComponent(deckId)}&view=1`)
  }

  const deleteDeck = async (id: string) => {
    if (!confirm('Delete deck and all its cards?')) return
    await db.decks.delete(id)
    await db.cards.where('deckId').equals(id).delete()
    loadDecks()
    if (activeDeck === id) {
      setActiveDeck(null)
      setMode('list')
    }
  }

  const dueCards = cards.filter((card) => card.due <= Date.now())
  const studyList = dueCards.length ? dueCards : cards

  const rate = async (quality: number) => {
    const card = studyList[studyIndex]
    if (!card) return
    const updated = { ...card, ...nextSR(card, quality), lastReviewed: Date.now() }
    await db.cards.put(updated)
    setCards((prev) => prev.map((item) => (item.id === card.id ? updated : item)))
    setFlipped(false)
    setStudyIndex((index) => (index + 1 >= studyList.length ? 0 : index + 1))
  }

  const generationDialogs = (
    <>
      <AIGenerationModal
        open={waitingVisible}
        status={generation.status}
        taskType="flashcards"
        fallbackNote={fallbackNote}
      />

      <GenerationSuccessModal
        open={generation.status === 'success' && !!success}
        heading="Your flashcards are ready!"
        message={
          success
            ? `Done! Your new study deck has been created successfully. You're one step closer to mastering ${success.source}.`
            : 'Done! Your new study deck has been created successfully.'
        }
        kind="flashcards"
        summary={
          success
            ? [
                { label: 'Deck', value: success.deckTitle },
                { label: 'Cards', value: `${success.count}` },
                { label: 'Source', value: success.source },
              ]
            : undefined
        }
        preview={success?.preview}
        primary={{ label: 'Start learning', onClick: startLearning }}
        secondary={{ label: 'View my deck', onClick: viewDeck }}
        tertiary={{ label: 'Back to learning', onClick: closeSuccess }}
        fallbackNote={fallbackNote}
        onClose={closeSuccess}
      />

      <GenerationErrorModal
        open={generation.status === 'error'}
        title={
          pendingSave
            ? 'Your cards are ready, but the deck could not be saved.'
            : 'That flashcard request could not be completed.'
        }
        message={
          pendingSave
            ? 'Studifree could not confirm that the deck was written to this browser. Your generated cards are still in memory.'
            : generation.error ?? 'Something went wrong while generating flashcards.'
        }
        savingFailed={!!pendingSave}
        retryLabel={pendingSave ? 'Try saving again' : 'Try generating again'}
        onRetry={pendingSave ? retrySave : generate}
        onClose={() => generation.reset()}
      />
    </>
  )

  // LIST MODE
  if (mode === 'list') {
    return (
      <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">Flashcards</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
              <HelpCircle className="w-4 h-4" /> Help
            </Button>
            <Button onClick={() => setCreateDeckOpen(true)}>
              <Plus className="w-4 h-4" /> New deck
            </Button>
          </div>
        </div>

        {pendingSave && (
          <div className="rounded-2xl border border-line-strong bg-surface p-4">
            <p className="text-sm font-medium text-ink">Your generated cards are waiting to be saved.</p>
            <p className="text-xs text-muted mt-1">
              They are still in this tab. Saving failed before the deck could be confirmed.
            </p>
            <Button size="sm" className="mt-3" onClick={retrySave}>
              <RefreshCw className="w-4 h-4" /> Try saving again
            </Button>
          </div>
        )}

        <AiRequired feature="AI flashcard generation">
          <Card>
            <h2 className="font-semibold text-ink mb-3">Generate with AI</h2>
            <div className="space-y-3">
              <Input
                label="Topic"
                value={genTopic}
                onChange={(event) => setGenTopic(event.target.value)}
                placeholder="Topic for flashcards"
              />
              <div>
                <label className="block text-sm text-muted mb-1.5">
                  Save to an existing deck (optional)
                </label>
                <select
                  value={selectedDeckId ?? ''}
                  onChange={(event) => setSelectedDeckId(event.target.value || null)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink"
                >
                  <option value="">Create a new deck from this topic</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Count"
                type="number"
                value={genCount}
                onChange={(event) => setGenCount(Number(event.target.value))}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={generate} disabled={generation.busy}>
                  {generation.busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {generation.busy ? 'Generating…' : 'Generate'}
                </Button>
                <GenerationStatusIndicator status={generation.status} taskType="flashcards" />
              </div>
              {formError && <p className="text-sm text-ink">{formError}</p>}
            </div>
          </Card>
        </AiRequired>

        <Card>
          <h2 className="font-semibold text-ink mb-3">Add card manually</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-muted mb-1.5">Deck</label>
              <select
                value={selectedDeckId ?? ''}
                onChange={(event) => setSelectedDeckId(event.target.value || null)}
                className="w-full px-4 py-2.5 rounded-2xl bg-inset border border-line text-ink"
              >
                <option value="">Select deck</option>
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Front (question)"
              value={newCard.front}
              onChange={(event) => setNewCard({ ...newCard, front: event.target.value })}
            />
            <Textarea
              placeholder="Back (answer)"
              value={newCard.back}
              onChange={(event) => setNewCard({ ...newCard, back: event.target.value })}
            />
            <Button onClick={addManualCard}>Add card</Button>
          </div>
        </Card>

        {decks.length === 0 ? (
          <EmptyState icon={Layers} title="No decks yet" description="Create a deck to start." />
        ) : (
          <ul className="space-y-2">
            {decks.map((deck) => (
              <li
                key={deck.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line"
              >
                <Layers className="w-5 h-5 text-muted" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{deck.name}</div>
                  <div className="text-xs text-muted">{deck.tags.join(', ') || 'No tags'}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => openDeck(deck.id)}>
                  Study
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${deck.name}`}
                  onClick={() => deleteDeck(deck.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Dialog open={createDeckOpen} onClose={() => setCreateDeckOpen(false)} title="New deck">
          <div className="space-y-3">
            <Input
              label="Deck name"
              value={newDeckName}
              onChange={(event) => setNewDeckName(event.target.value)}
            />
            <Button onClick={createDeck} className="w-full">
              Create
            </Button>
          </div>
        </Dialog>
        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Flashcards help">
          <div className="space-y-2 text-sm text-muted">
            <p>
              <strong className="text-ink">What it does:</strong> Create decks and review cards with
              spaced repetition.
            </p>
            <p>
              <strong className="text-ink">How to use:</strong> Create a deck, add cards manually or
              generate with AI, then Study. Rate each card to schedule reviews.
            </p>
            <p>
              <strong className="text-ink">If it fails:</strong> Check your API key for generation. If a
              generated deck cannot be saved, your cards stay in the tab so you can retry.
            </p>
          </div>
        </Dialog>

        {generationDialogs}
      </div>
    )
  }

  // DETAIL MODE
  if (mode === 'detail') {
    return (
      <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={backToDecks}>
            <ArrowLeft className="w-4 h-4" /> All decks
          </Button>
          <span className="text-sm text-muted">{cards.length} cards</span>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Deck</p>
          <h1 className="text-2xl font-semibold text-ink mt-1">{activeDeckName}</h1>
          <p className="text-sm text-muted mt-2">Saved in this browser.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => activeDeck && openDeck(activeDeck)} disabled={!cards.length}>
            Start learning
          </Button>
          <Button variant="secondary" onClick={backToDecks}>
            Back to decks
          </Button>
        </div>

        {cards.length === 0 ? (
          <EmptyState title="This deck is empty" description="Add cards from the flashcards screen." />
        ) : (
          <ul className="space-y-2">
            {cards.map((card, index) => (
              <li key={card.id} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-[11px] text-faint tabular-nums">Card {index + 1}</p>
                <p className="text-sm font-medium text-ink mt-1 whitespace-pre-wrap">{card.front}</p>
                <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{card.back}</p>
              </li>
            ))}
          </ul>
        )}

        {generationDialogs}
      </div>
    )
  }

  // STUDY MODE
  const card = studyList[studyIndex]
  if (!card) {
    return (
      <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={backToDecks}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <EmptyState title="No cards to review" description="All caught up, or add cards to this deck." />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={backToDecks}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="text-right">
          <p className="text-sm text-ink">{activeDeckName}</p>
          <span className="text-xs text-muted">
            {studyIndex + 1} / {studyList.length}
          </span>
        </div>
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

      {flipped ? (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="secondary" onClick={() => rate(1)}>
            <X className="w-4 h-4" /> Again
          </Button>
          <Button variant="secondary" onClick={() => rate(3)}>
            Hard
          </Button>
          <Button variant="secondary" onClick={() => rate(4)}>
            Good
          </Button>
          <Button onClick={() => rate(5)}>
            <Check className="w-4 h-4" /> Easy
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button onClick={() => setFlipped(true)}>
            <RotateCcw className="w-4 h-4" /> Show answer
          </Button>
        </div>
      )}
    </div>
  )
}
