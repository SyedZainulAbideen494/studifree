import React, { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { Card } from '../components/UI/Card'

const sections = [
  { title: 'Getting started', items: [
    { q: 'What is Studifree?', a: 'Studifree is a free learning platform. You can learn topics, upload PDFs/images, create flashcards and quizzes, and track progress. No account required.' },
    { q: 'How do I start?', a: 'Go to Home, type a topic, choose a style, press Learn. Or open AI Setup to add your API key first.' },
  ]},
  { title: 'AI and API keys', items: [
    { q: 'What is an API key?', a: 'A password-like string that lets Studifree call an AI service. You create it in your provider account.' },
    { q: 'Is AI free?', a: 'Studifree is free. AI providers may charge or have quotas. You use your own key.' },
    { q: 'How to get a Gemini key?', a: 'Visit Google AI Studio, create a key, paste it in AI Setup, then test the connection.' },
    { q: 'Why did my model fail?', a: 'Models can be busy (503/429). Studifree retries and may switch to a fallback. You can also pick another model.' },
  ]},
  { title: 'Learning features', items: [
    { q: 'How to upload a PDF?', a: 'In Learn, choose Upload PDF. Studifree extracts text locally and uses it as source.' },
    { q: 'How to create flashcards?', a: 'Use Flashcards page: generate with AI from a topic or add manually. Review with spaced repetition.' },
    { q: 'How to take a quiz?', a: 'Open Quiz Studio, set topic/count/difficulty/mode, generate, answer, submit.' },
    { q: 'How does adaptive learning work?', a: 'Studifree tracks your answers and mastery. Repeated gaps trigger remedial lessons.' },
  ]},
  { title: 'Data and privacy', items: [
    { q: 'Where is my data stored?', a: 'On your device (IndexedDB/LocalStorage). Nothing is uploaded by Studifree.' },
    { q: 'How to export data?', a: 'Settings → Export data. Import the same file to restore.' },
    { q: 'How to delete data?', a: 'Settings → Clear all data.' },
  ]},
  { title: 'Troubleshooting', items: [
    { q: 'App not loading?', a: 'Refresh, clear cache, or reinstall the PWA.' },
    { q: 'AI errors?', a: 'Check key, model availability, and internet connection.' },
  ]},
]

export default function Help() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Help Centre</h1>
      <p className="text-muted">Plain-language guides for every feature.</p>
      {sections.map((sec) => (
        <Card key={sec.title}>
          <h2 className="font-semibold text-ink mb-3">{sec.title}</h2>
          <div className="space-y-2">
            {sec.items.map((it) => {
              const key = sec.title + it.q
              return (
                <div key={key} className="border border-line rounded-2xl">
                  <button onClick={() => setOpen(open === key ? null : key)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-medium text-ink">{it.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted transition ${open === key ? 'rotate-180' : ''}`} />
                  </button>
                  {open === key && <div className="px-4 pb-3 text-sm text-muted">{it.a}</div>}
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}
