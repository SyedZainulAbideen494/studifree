import React from 'react'
import { brainCopy, learningPrinciples } from '../../data/landing'
import { Reveal, SectionHead } from './shared'
import { DataRain, NeuralField } from './visuals'

/** Research-interface section: a neural field paired with honest study principles. */
export function BrainSection() {
  return (
    <section className="sf-brain sf-section" id="brain" aria-labelledby="brain-title">
      <DataRain className="sf-brain__rain" />

      <div className="sf-container">
        <div className="sf-brain__layout">
          <div className="sf-brain__copy">
            <SectionHead
              eyebrow={brainCopy.eyebrow}
              id="brain-title"
              title={brainCopy.title}
              description={brainCopy.lead}
              meta="SF / CORTEX"
            />
            <p className="sf-brain__note">{brainCopy.note}</p>
          </div>

          <Reveal className="sf-brain__field" y={18}>
            <NeuralField />
          </Reveal>
        </div>

        <div className="sf-brain__principles">
          {learningPrinciples.map((principle, index) => (
            <Reveal
              key={principle.id}
              className="sf-brain__principle"
              delay={index * 0.05}
            >
              <span className="sf-brain__number">{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
