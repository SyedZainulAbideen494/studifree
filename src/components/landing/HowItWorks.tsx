import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { howItWorksSteps } from '../../data/landing'
import { LandingLink, Reveal, SectionHead } from './shared'

const stepLabels = ['INPUT', 'PROCESS', 'SIGNAL'] as const

/**
 * The operating sequence.
 *
 * A sticky editorial statement on the left, a technical timeline on the right.
 * Numbered rows use hairlines and tabular figures rather than decorative cards.
 */
export function HowItWorks() {
  return (
    <section className="sf-section sf-how" id="how-it-works" aria-labelledby="how-title">
      <div className="sf-container">
        <div className="sf-how__layout">
          <div className="sf-how__aside">
            <Reveal>
              <SectionHead
                eyebrow="How it works"
                meta="04 / SEQUENCE"
                title={<span id="how-title">Start with one topic. Build from there.</span>}
                description="No complicated setup. Open a tool, choose what you want to learn, and let the session take shape."
              />
            </Reveal>

            <Reveal className="sf-how__aside-foot" delay={0.08} y={16}>
              <div className="sf-how__signal" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>
                Three moves, repeated as often as you need. The system stays quiet; the learning does the
                work.
              </p>
              <LandingLink href="/home" variant="secondary" size="sm" showArrow>
                Open Studifree
              </LandingLink>
            </Reveal>
          </div>

          <ol className="sf-how__track">
            {howItWorksSteps.map((step, index) => (
              <li className="sf-how__item" key={step.number}>
                <Reveal className="sf-how__step" y={20} delay={0.04 * index}>
                  <div className="sf-how__step-head">
                    <span className="sf-how__step-number" aria-hidden="true">
                      {step.number}
                    </span>
                    <span className="sf-how__step-label">{stepLabels[index] ?? 'STEP'}</span>
                  </div>

                  <div className="sf-how__step-body">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <span className="sf-how__step-detail">{step.detail}</span>
                  </div>

                  <span className="sf-how__step-mark" aria-hidden="true">
                    <ArrowUpRight width={15} height={15} />
                  </span>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
