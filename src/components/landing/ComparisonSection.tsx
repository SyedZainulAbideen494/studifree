import React from 'react'
import { Check, Minus } from 'lucide-react'
import { comparisonCopy, comparisonRows } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

/** Careful, non-attacking comparison. No claim about how other tools store data. */
export function ComparisonSection() {
  return (
    <section className="sf-compare sf-section" id="compare" aria-labelledby="compare-title">
      <div className="sf-container">
        <SectionHead
          eyebrow={comparisonCopy.eyebrow}
          id="compare-title"
          title={comparisonCopy.title}
          description={comparisonCopy.lead}
        />

        <Reveal className="sf-compare__table" y={20}>
          <div className="sf-compare__head" aria-hidden="true">
            <span>Dimension</span>
            <span>Traditional platform</span>
            <span className="sf-compare__studifree">
              <span className="sf-compare__mark" /> Studifree
            </span>
          </div>

          {comparisonRows.map((row) => (
            <div className="sf-compare__row" key={row.area}>
              <span className="sf-compare__area">{row.area}</span>
              <span className="sf-compare__traditional">
                <Minus width={12} height={12} aria-hidden="true" />
                {row.traditional}
              </span>
              <span className="sf-compare__value">
                <Check width={13} height={13} aria-hidden="true" />
                {row.studifree}
              </span>
            </div>
          ))}
        </Reveal>

        <p className="sf-compare__note">
          Different products make different trade-offs. This table describes Studifree’s intended
          approach, not a claim that every other platform works the same way.
        </p>
      </div>
    </section>
  )
}
