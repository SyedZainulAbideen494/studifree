import React from 'react'
import { Card } from '../components/UI/Card'

const sections = [
  { h: 'Local data storage', p: 'Studifree stores your learning data on your device using IndexedDB and LocalStorage. Studifree servers do not receive your data.' },
  { h: 'API-key handling', p: 'If you add an API key, it is stored in your browser. It is sent only to the AI provider you choose when you use AI features. Do not use on shared devices.' },
  { h: 'Third-party AI providers', p: 'When you use AI features, your prompts and uploaded content are sent to the selected provider, subject to that provider\'s terms and privacy policy.' },
  { h: 'File processing', p: 'PDFs and images are processed locally in your browser to extract text. File contents may be sent to your AI provider if you request AI features on them.' },
  { h: 'Data deletion', p: 'You can delete all data from Settings. Clearing browser data also removes it.' },
  { h: 'Export', p: 'You can export all data as JSON from Settings.' },
  { h: 'AI limitations', p: 'AI output may be inaccurate or inappropriate. You are responsible for verifying content.' },
  { h: 'User responsibility for uploaded content', p: 'You must have rights to any content you upload.' },
]

export default function Privacy() {
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Privacy Policy (Draft)</h1>
      <p className="text-xs text-faint">Draft for review by a qualified professional before public launch.</p>
      {sections.map((s) => (
        <Card key={s.h}>
          <h2 className="font-semibold text-ink mb-2">{s.h}</h2>
          <p className="text-muted leading-relaxed">{s.p}</p>
        </Card>
      ))}
    </div>
  )
}
