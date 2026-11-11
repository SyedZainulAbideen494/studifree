import React from 'react'
import {
  Brain,
  ClipboardCheck,
  FileUp,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react'
import { engineCards, engineCopy, type EngineCard } from '../../data/landing'
import { Reveal, SectionHead, TiltPanel, cx } from './shared'

const icons = {
  recall: Brain,
  flashcards: Layers,
  explanations: Sparkles,
  adaptive: Target,
  quiz: ClipboardCheck,
  material: FileUp,
} as const

function CardVisual({ card }: { card: EngineCard }) {
  if (card.id === 'recall') {
    return (
      <div className="sf-engine__recall" aria-hidden="true">
        <span className="sf-engine__ring sf-engine__ring--a" />
        <span className="sf-engine__ring sf-engine__ring--b" />
        <span className="sf-engine__ring sf-engine__ring--c" />
        <span className="sf-engine__question">Q</span>
        <span className="sf-engine__answer">A</span>
        <span className="sf-engine__recall-label">RETRIEVE → REVEAL → REPEAT</span>
      </div>
    )
  }

  if (card.id === 'flashcards') {
    return (
      <div className="sf-engine__stack" aria-hidden="true">
        <span />
        <span />
        <span>
          <em>Q</em>
          <em>A</em>
        </span>
      </div>
    )
  }

  if (card.id === 'explanations') {
    return (
      <div className="sf-engine__bubbles" aria-hidden="true">
        <span>Explain simply</span>
        <span>Give an example</span>
        <span>Go deeper</span>
      </div>
    )
  }

  if (card.id === 'adaptive') {
    return (
      <div className="sf-engine__bars" aria-hidden="true">
        <span style={{ height: '42%' }} />
        <span style={{ height: '68%' }} />
        <span style={{ height: '34%' }} />
        <span style={{ height: '86%' }} />
        <span style={{ height: '56%' }} />
      </div>
    )
  }

  if (card.id === 'quiz') {
    return (
      <div className="sf-engine__quiz" aria-hidden="true">
        <span />
        <span className="is-active" />
        <span />
      </div>
    )
  }

  return (
    <div className="sf-engine__flow" aria-hidden="true">
      <span className="sf-engine__file">PDF</span>
      <span className="sf-engine__flow-line" />
      <span className="sf-engine__outputs">
        <em>cards</em>
        <em>quiz</em>
        <em>notes</em>
      </span>
    </div>
  )
}

/** Asymmetric capability grid — each card has its own small mechanical visual. */
export function LearningEngine() {
  return (
    <section className="sf-engine sf-section" id="features" aria-labelledby="engine-title">
      <div className="sf-container">
        <SectionHead
          eyebrow={engineCopy.eyebrow}
          id="engine-title"
          title={engineCopy.title}
          description={engineCopy.lead}
          meta="SF / ENGINE"
        />

        <div className="sf-engine__grid">
          {engineCards.map((card, index) => {
            const Icon = icons[card.id as keyof typeof icons]
            return (
              <Reveal
                key={card.id}
                className={cx('sf-engine__cell', `sf-engine__cell--${card.size}`)}
                delay={index * 0.045}
              >
                <TiltPanel className={cx('sf-engine__card', `is-${card.accent}`)} intensity={3}>
                  <div className="sf-engine__head">
                    <span className="sf-engine__icon" aria-hidden="true">
                      <Icon width={17} height={17} />
                    </span>
                    <span className="sf-engine__index">{card.index}</span>
                  </div>

                  <CardVisual card={card} />

                  <div className="sf-engine__copy">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                    <span className="sf-engine__meta">{card.meta}</span>
                  </div>
                </TiltPanel>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
