import React from 'react'
import { Compass, Cpu, Footprints, Lightbulb } from 'lucide-react'
import { principles } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

const icons = [Compass, Lightbulb, Footprints, Cpu]

export function Principles() {
  return (
    <section className="sf-section" id="why-studifree" aria-labelledby="principles-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="Principles"
            title={<span id="principles-title">What we won’t trade away.</span>}
            description="These are the choices that shape the product. They are deliberately simple, and they are meant to survive new features."
          />
        </Reveal>

        <div className="sf-principles">
          {principles.map((principle, index) => {
            const Icon = icons[index] ?? Compass
            return (
              <Reveal className="sf-principle" key={principle.number} delay={0.06 * index} y={18}>
                <span className="sf-principle__icon" aria-hidden="true">
                  <Icon width={17} height={17} />
                </span>
                <span className="sf-principle__index">{principle.number}</span>
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
