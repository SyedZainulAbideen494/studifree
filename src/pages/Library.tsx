import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Folder, FileText, Layers, ClipboardCheck, Trash2, Pencil } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { EmptyState } from '../components/UI/EmptyState'
import { db } from '../db'
import { uid } from '../utils/id'

type Item = { id: string; kind: string; name: string; createdAt: number }

export default function Library() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Item[]>([])

  const load = async () => {
    const lessons = await db.lessons.toArray()
    const decks = await db.decks.toArray()
    const quizzes = await db.quizzes.toArray()
    const all: Item[] = [
      ...lessons.map((l) => ({ id: l.id, kind: 'lesson', name: l.title, createdAt: l.updatedAt })),
      ...decks.map((d) => ({ id: d.id, kind: 'deck', name: d.name, createdAt: d.updatedAt })),
      ...quizzes.map((qz) => ({ id: qz.id, kind: 'quiz', name: qz.title, createdAt: qz.createdAt })),
    ]
    all.sort((a, b) => b.createdAt - a.createdAt)
    setItems(all)
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))

  const remove = async (item: Item) => {
    if (!confirm('Delete this item?')) return
    if (item.kind === 'lesson') await db.lessons.delete(item.id)
    if (item.kind === 'deck') { await db.decks.delete(item.id); await db.cards.where('deckId').equals(item.id).delete() }
    if (item.kind === 'quiz') await db.quizzes.delete(item.id)
    load()
  }

  const rename = async (item: Item) => {
    const name = prompt('New name', item.name)
    if (!name) return
    if (item.kind === 'lesson') await db.lessons.update(item.id, { title: name, updatedAt: Date.now() })
    if (item.kind === 'deck') await db.decks.update(item.id, { name, updatedAt: Date.now() })
    if (item.kind === 'quiz') await db.quizzes.update(item.id, { title: name })
    load()
  }

  const iconFor = (kind: string) => kind === 'lesson' ? FileText : kind === 'deck' ? Layers : ClipboardCheck

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Library</h1>
      <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      {filtered.length === 0 ? (
        <EmptyState icon={Folder} title="Nothing here yet" description="Saved lessons, decks and quizzes will appear here." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => {
            const Icon = iconFor(item.kind)
            return (
              <li key={item.id + item.kind} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line">
                <Icon className="w-5 h-5 text-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{item.name}</div>
                  <div className="text-xs text-muted">{item.kind} · {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => rename(item)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(item)}><Trash2 className="w-4 h-4" /></Button>
                <Button variant="secondary" size="sm" onClick={() => {
                  if (item.kind === 'lesson') navigate(`/learn?lesson=${item.id}`)
                  if (item.kind === 'deck') navigate(`/flashcards?deck=${item.id}`)
                  if (item.kind === 'quiz') navigate(`/quiz?quiz=${item.id}`)
                }}>Open</Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
