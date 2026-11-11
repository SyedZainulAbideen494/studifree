import React from 'react'
import { finalCtaCopy } from '../../data/landing'
import { LandingLink, Reveal } from './shared'
import { Aura } from './visuals'

/** Closing frame: the intelligence form returns, transformed and calmer. */
export function FinalCTA() {
  return (
    <section className="sf-final" id="begin" aria-labelledby="final-title">
      <div className="sf-final__aura">
        <Aura variant="final" />
      </div>
      <div className="sf-final__energy" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="sf-container sf-final__inner">
        <p className="sf-label">{finalCtaCopy.eyebrow}</p>
        <Reveal>
          <h2 className="sf-final__title" id="final-title">
            {finalCtaCopy.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="sf-final__description">{finalCtaCopy.description}</p>
        </Reveal>
        <Reveal className="sf-final__actions" delay={0.12}>
          <LandingLink href="/home" variant="primary" size="lg" showArrow>
            {finalCtaCopy.primaryCta}
          </LandingLink>
          <LandingLink href="#how-it-works" variant="secondary" size="lg">
            {finalCtaCopy.secondaryCta}
          </LandingLink>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="sf-final__note">{finalCtaCopy.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
