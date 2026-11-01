import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'

const sections = [
  {
    h: 'Local data storage',
    p: 'Studifree stores your learning data on your device using IndexedDB and LocalStorage. Your lessons, decks, cards, quizzes and settings are not uploaded to a Studifree server.',
  },
  {
    h: 'Visitor notifications',
    p: 'When you open the deployed Studifree website, the site may send a visitor notification email through EmailJS. This notification contains the visit time, page URL, your IP address (looked up through ipify), browser user agent, language, screen size, timezone, referrer and platform. It is used only to understand visits to the site. It is not linked to your study data. EmailJS acts as a third-party delivery service for these notifications.',
  },
  {
    h: 'Optional location sharing',
    p: 'The deployed site asks once whether you want to share your device location. No coordinates are read from your browser unless you press “Allow location”. If you allow, your latitude, longitude and location accuracy in metres are sent in the same visitor notification together with the visit time, page URL and IP address. If you decline, no location is collected or sent. Your choice is stored in this browser and can be reset in Settings → Privacy.',
  },
  {
    h: 'API-key handling',
    p: 'If you add an API key, it is stored in your browser. It is sent only to the AI provider you choose when you use AI features. Browser storage is not completely secure against someone with access to your browser profile, so avoid shared devices. You can remove the key at any time in AI Setup. Studifree does not log your key or include it in error messages.',
  },
  {
    h: 'Third-party AI providers',
    p: "When you use AI features, your prompts and uploaded content are sent to the selected provider, subject to that provider's terms and privacy policy. Google processes Gemini API requests under your own account and may apply quotas or charges.",
  },
  {
    h: 'File processing',
    p: 'PDFs and images are processed locally in your browser to extract text. File contents may be sent to your AI provider if you request AI features on them.',
  },
  {
    h: 'Data deletion',
    p: 'You can delete all local data from Settings. Clearing browser data also removes it. Deleting local data does not delete visitor notification emails already delivered, or records held by third-party providers.',
  },
  {
    h: 'Export',
    p: 'You can export your study data as JSON from Settings at any time.',
  },
  {
    h: 'AI limitations',
    p: 'AI output may be inaccurate or inappropriate. You are responsible for verifying content before relying on it.',
  },
  {
    h: 'User responsibility for uploaded content',
    p: 'You must have the rights to any content you upload.',
  },
]

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Privacy Policy (Draft)</h1>
        <p className="text-xs text-faint mt-1">Draft for review by a qualified professional before public launch.</p>
      </div>

      {sections.map((s) => (
        <Card key={s.h}>
          <h2 className="font-semibold text-ink mb-2">{s.h}</h2>
          <p className="text-muted leading-relaxed">{s.p}</p>
        </Card>
      ))}

      <Card>
        <h2 className="font-semibold text-ink mb-2">Questions about privacy</h2>
        <p className="text-sm text-muted mb-3">
          The FAQ and Help Centre explain how location consent, AI keys and local storage work in practice.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/about#faq')}>
            Read the FAQ
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/help')}>
            Open Help Centre
          </Button>
        </div>
      </Card>
    </div>
  )
}
