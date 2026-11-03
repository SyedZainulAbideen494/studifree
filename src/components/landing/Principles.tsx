import React from 'react'
import { Compass, Cpu, Footprints, Lightbulb } from 'lucide-react'
import { principles } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

const icons = [Compass, Lightbulb, Footprints, Cpu]

/**
 * The manifesto. Four constraints, set as a ledger rather than a card grid so
 * the section reads like policy instead of decoration.
 */
export function Principles() {
  return (
    <section className="sf-section sf-principles-section" id="why-studifree" aria-labelledby="principles-title">
      <div className="sf-container">
        <div className="sf-principles__head">
          <Reveal>
            <SectionHead
              eyebrow="Principles"
              meta="08 / CREED"
              title={<span id="principles-title">What we won’t trade away.</span>}
              description="These are the choices that shape the product. They are deliberately simple, and they are meant to survive new features."
            />
          </Reveal>

          <Reveal className="sf-principles__aside" delay={0.08} y={16}>
            <span className="sf-principles__aside-code">SF / CONSTRAINTS / 01—04</span>
            <p>
              A short constitution for the product: access before paywalls, understanding before answers,
              pace before pressure, and technology in service of thought.
            </p>
          </Reveal>
        </div>

        <div className="sf-principles">
          {principles.map((principle, index) => {
            const Icon = icons[index] ?? Compass
            return (
              <Reveal className="sf-principle" key={principle.number} delay={0.05 * index} y={18}>
                <span className="sf-principle__icon" aria-hidden="true">
                  <Icon width={17} height={17} />
                </span>
                <span className="sf-principle__index" aria-hidden="true">
                  {principle.number}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
