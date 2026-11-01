import React, { useState } from 'react'
import { ChevronDown, ExternalLink, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'

interface HelpItem {
  q: string
  a: React.ReactNode
}

const sections: { title: string; items: HelpItem[] }[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is Studifree?',
        a: 'Studifree is a free learning platform. You can learn topics, upload PDFs/images, create flashcards and quizzes, and track progress. No account is required for the core local tools.',
      },
      {
        q: 'How do I start?',
        a: 'Go to Home, type a topic, choose a style, then press Explain. Or open AI Setup first to add a Gemini API key.',
      },
      {
        q: 'Where do I set up AI?',
        a: (
          <>
            Open <Link to="/ai-setup" className="text-ink underline">Settings → AI Setup</Link>, paste your
            Gemini API key, save and press Test connection.
          </>
        ),
      },
    ],
  },
  {
    title: 'AI and API keys',
    items: [
      {
        q: 'What is an API key?',
        a: 'A password-like string that lets Studifree call an AI service. You create it in your provider account. Studifree never shows it publicly or logs it.',
      },
      {
        q: 'Is AI free?',
        a: "Studifree is free. AI providers may charge or have quotas. You use your own key, and Google's current pricing applies.",
      },
      {
        q: 'How do I get a Gemini key?',
        a: (
          <>
            Visit{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline inline-flex items-center gap-1"
            >
              Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
            </a>
            , sign in, create a key, then paste it into AI Setup and test the connection.
          </>
        ),
      },
      {
        q: 'Why did my model fail?',
        a: 'Models can be busy (503/429). Studifree retries and may switch to a fallback. You can also pick another model in AI Setup.',
      },
      {
        q: 'Can I use Studifree without AI?',
        a: 'Yes. Manual flashcards, local lessons, the planner, focus timer and progress tracking work without a key. AI generation is optional.',
      },
    ],
  },
  {
    title: 'Learning features',
    items: [
      {
        q: 'How do I upload a PDF?',
        a: 'In Learn, choose Upload PDF. Studifree extracts text locally and uses it as source material.',
      },
      {
        q: 'How do I create flashcards?',
        a: 'Use the Flashcards page: generate with AI from a topic or add cards manually. Review with spaced repetition.',
      },
      {
        q: 'How do I take a quiz?',
        a: 'Open Quiz Studio, set topic/count/difficulty/mode, generate, answer and submit.',
      },
      {
        q: 'How does adaptive learning work?',
        a: 'Studifree tracks your answers and mastery. Repeated gaps trigger remedial lessons.',
      },
      {
        q: 'Where are my saved lessons?',
        a: 'Saved lessons appear in your Library and on Home under Continue learning.',
      },
    ],
  },
  {
    title: 'Privacy, data and location',
    items: [
      {
        q: 'Where is my study data stored?',
        a: 'On your device (IndexedDB/LocalStorage). Your study data is not uploaded to a Studifree server.',
      },
      {
        q: 'How do I export data?',
        a: 'Settings → Export data. Import the same file to restore your work.',
      },
      {
        q: 'How do I delete data?',
        a: 'Settings → Clear all data. This cannot be undone.',
      },
      {
        q: 'Does Studifree collect my location?',
        a: 'Only if you choose “Allow location” in the optional personalisation prompt. Your coordinates are used once to look up a general country and region; precise coordinates are not stored or sent to the AI. Declining means no location is read and Studifree works normally.',
      },
      {
        q: 'How do I change or disable location personalisation?',
        a: 'Open Settings → Location personalisation to disable or reset it. You can also revoke browser location permission in your browser’s site settings. AI regional context is a separate switch inside Learn and is off by default.',
      },
      {
        q: 'What does the visitor notification contain?',
        a: 'The deployed site may email the visit time, page URL, IP address, browser details, language, screen size, timezone and referrer. Precise location is included only if you separately switch on location in visitor analytics. The Privacy Policy explains this in full.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      { q: 'App not loading?', a: 'Refresh, clear the cache, or reinstall the PWA.' },
      { q: 'AI errors?', a: 'Open AI Setup, test the connection and check your key, model availability and internet connection.' },
      {
        q: 'Where can I read more?',
        a: (
          <>
            The <Link to="/about#faq" className="text-ink underline">About page FAQ</Link> answers common questions,
            and the <Link to="/privacy" className="text-ink underline">Privacy Policy</Link> explains data handling.
          </>
        ),
      },
    ],
  },
]

export default function Help() {
  const [open, setOpen] = useState<string | null>(null)
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Help Centre</h1>
        <p className="text-muted mt-1">Plain-language guides for every feature.</p>
      </div>

      <Card glass className="border-line-strong">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-ink" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-ink">Looking for a quick answer?</h2>
            <p className="text-xs text-muted mt-1">
              The FAQ covers setup, API keys, features, privacy and storage in one searchable place.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={() => navigate('/about#faq')}>
                Browse FAQ
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/ai-setup')}>
                Open AI Setup
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {sections.map((sec) => (
        <Card key={sec.title}>
          <h2 className="font-semibold text-ink mb-3">{sec.title}</h2>
          <div className="space-y-2">
            {sec.items.map((it) => {
              const key = sec.title + it.q
              const isOpen = open === key
              return (
                <div key={key} className="border border-line rounded-2xl">
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{it.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted transition shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <div className="px-4 pb-3 text-sm text-muted leading-relaxed">{it.a}</div>}
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}
