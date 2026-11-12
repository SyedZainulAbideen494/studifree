import React from 'react'
import { futureMomentCopy } from '../../data/landing'
import { Reveal } from './shared'

/** A quiet signal between the personal note and the FAQ. */
export function FutureMoment() {
  return (
    <section className="sf-future" aria-label="Information becomes knowledge">
      <div className="sf-future__line" aria-hidden="true">
        <span />
      </div>
      <div className="sf-container sf-future__inner">
        <p className="sf-label">{futureMomentCopy.eyebrow}</p>
        <Reveal>
          <h2 className="sf-future__title">{futureMomentCopy.title}</h2>
        </Reveal>
        <p className="sf-future__note">{futureMomentCopy.note}</p>
      </div>
    </section>
  )
}
