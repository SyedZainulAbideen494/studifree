import React from 'react'
import { Card } from '../components/UI/Card'

const docs = [
  { h: 'Terms of Use (Draft)', p: 'Studifree is provided as-is for educational use. You are responsible for how you use it and for verifying AI-generated content. Not affiliated with any educational board or exam authority.' },
  { h: 'AI Disclaimer', p: 'AI-generated content may be incorrect, incomplete or biased. Do not rely on it for safety-critical, medical, legal or financial decisions.' },
  { h: 'Acceptable Use Policy', p: 'Do not use Studifree to generate harmful, illegal or infringing content. Respect third-party terms.' },
  { h: 'Third-party service disclosure', p: 'AI features require a third-party provider account and key. Provider terms, quotas and charges apply.' },
  { h: 'Copyright and user-uploaded material', p: 'You retain rights to your uploads. You must not upload material you do not have rights to.' },
]

export default function Legal() {
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Legal (Draft)</h1>
      <p className="text-xs text-faint">Draft documents for review by a qualified professional before public launch.</p>
      {docs.map((d) => (
        <Card key={d.h}>
          <h2 className="font-semibold text-ink mb-2">{d.h}</h2>
          <p className="text-muted leading-relaxed">{d.p}</p>
        </Card>
      ))}
    </div>
  )
}
