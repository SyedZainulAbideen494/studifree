import React from 'react'
import { privacyCopy, privacyLimits } from '../../data/landing'
import { Reveal } from './shared'
import { Aura } from './visuals'

/** Local-first privacy, including the honest limits. */
export function PrivacySection() {
  return (
    <section className="sf-privacy sf-section" id="privacy" aria-labelledby="privacy-title">
      <div className="sf-privacy__aura">
        <Aura variant="privacy" />
      </div>

      <div className="sf-container sf-privacy__inner">
        <div className="sf-privacy__head">
          <p className="sf-label">{privacyCopy.eyebrow}</p>
          <h2 className="sf-privacy__title" id="privacy-title">
            {privacyCopy.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>

        <Reveal className="sf-privacy__lead" y={18}>
          <p>{privacyCopy.lead}</p>
        </Reveal>

        <div className="sf-privacy__limits">
          {privacyLimits.map((limit, index) => (
            <Reveal key={limit.title} className="sf-privacy__limit" delay={index * 0.06}>
              <h3>{limit.title}</h3>
              <p>{limit.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="sf-privacy__note">
          <span aria-hidden="true">!</span>
          <p>{privacyCopy.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
