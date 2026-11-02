import React from 'react'
import { howItWorksSteps } from '../../data/landing'
import { LandingLink, Reveal, SectionHead } from './shared'

export function HowItWorks() {
  return (
    <section className="sf-section" id="how-it-works" aria-labelledby="how-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="How it works"
            title={<span id="how-title">Start with one topic. Build from there.</span>}
            description="No complicated setup. Open a tool, choose what you want to learn, and let the session take shape."
          />
        </Reveal>

        <div className="sf-steps">
          {howItWorksSteps.map((step, index) => (
            <Reveal className="sf-step" key={step.number} delay={0.08 * index} y={18}>
              <span className="sf-step__number" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <p className="sf-step__detail">{step.detail}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="sf-steps__cta" y={12}>
          <LandingLink href="/home" variant="primary" size="lg" showArrow>
            Open Studifree
          </LandingLink>
        </Reveal>
      </div>
    </section>
  )
}
