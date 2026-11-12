import React from 'react'
import { statementCopy } from '../../data/landing'
import { Reveal, ScrollFocusText } from './shared'

/** Large editorial statement whose words sharpen as the reader scrolls. */
export function StatementSection() {
  return (
    <section className="sf-statement sf-section" id="what" aria-labelledby="statement-title">
      <div className="sf-container">
        <div className="sf-statement__meta">
          <p className="sf-label">{statementCopy.eyebrow}</p>
        </div>

        <ScrollFocusText
          text={statementCopy.title}
          className="sf-statement__title"
          id="statement-title"
        />

        <Reveal className="sf-statement__support" delay={0.05}>
          <span className="sf-statement__rule" aria-hidden="true" />
          <p>{statementCopy.support}</p>
        </Reveal>
      </div>

      <div className="sf-statement__orb" aria-hidden="true" />
    </section>
  )
}
