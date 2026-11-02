import React from 'react'
import { LandingLink, Reveal } from './shared'

const chips = [
  { className: 'sf-final__chip--one', label: 'Understand' },
  { className: 'sf-final__chip--two', label: 'Recall' },
  { className: 'sf-final__chip--three', label: 'Practise' },
  { className: 'sf-final__chip--four', label: 'Plan' },
]

export function FinalCTA() {
  return (
    <section className="sf-final" id="start" aria-labelledby="final-title">
      <div className="sf-final__orb sf-final__orb--one" aria-hidden="true" />
      <div className="sf-final__orb sf-final__orb--two" aria-hidden="true" />

      <div className="sf-final__chips" aria-hidden="true">
        {chips.map((chip) => (
          <span key={chip.label} className={`sf-final__chip ${chip.className}`}>
            {chip.label}
          </span>
        ))}
      </div>

      <div className="sf-container">
        <div className="sf-final__inner">
          <Reveal y={12}>
            <p className="sf-eyebrow">Start here</p>
          </Reveal>

          <Reveal delay={0.04} y={18}>
            <h2 className="sf-h2 sf-final__title" id="final-title">
              Your next study session can feel different.
            </h2>
          </Reveal>

          <Reveal delay={0.08} y={14}>
            <p className="sf-lead sf-final__text">
              Bring one topic. Choose one tool. Studifree gives you a calm place to understand it, remember
              it and see what to do next.
            </p>
          </Reveal>

          <Reveal className="sf-actions" delay={0.12} y={12} style={{ justifyContent: 'center' }}>
            <LandingLink href="/home" variant="primary" size="lg" showArrow>
              Start learning — it’s free
            </LandingLink>
            <LandingLink href="/ai-setup" variant="secondary" size="lg">
              Set up AI
            </LandingLink>
          </Reveal>

          <Reveal delay={0.16} y={10}>
            <p className="sf-final__note">
              No mandatory account for supported local tools · AI is optional · Bring your own key
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
