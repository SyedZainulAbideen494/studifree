import React from 'react'
import { Check, KeyRound, Sparkles } from 'lucide-react'
import { aiPoweredFeatures, freeCoreFeatures } from '../../data/landing'
import { LandingLink, Reveal, SectionHead } from './shared'

export function FreeModelSection() {
  return (
    <section className="sf-section sf-free" id="free" aria-labelledby="free-title">
      <div className="sf-container">
        <div className="sf-free__layout">
          <Reveal className="sf-free__copy">
            <SectionHead
              eyebrow="Free core · bring your own AI key"
              title={<span id="free-title">A transparent way to use AI.</span>}
              description="Studifree does not sell a subscription to an AI allowance. The core learning tools are free, and AI features connect directly to your own Google AI Studio project."
            />

            <p className="sf-body">
              That keeps the model simple: you choose whether you need AI, you control the key, and Google’s
              current quotas and pricing apply to your own project. There is no shared Studifree AI pool and
              no hidden “unlimited” promise.
            </p>

            <div className="sf-actions">
              <LandingLink href="#api-keys" variant="secondary" showArrow>
                See how AI setup works
              </LandingLink>
              <LandingLink href="/home" variant="primary" showArrow>
                Start learning
              </LandingLink>
            </div>

            <div className="sf-glass sf-glass--flat" style={{ padding: 20, borderRadius: 20 }}>
              <p className="sf-caption" style={{ marginBottom: 10 }}>
                What “free” means here
              </p>
              <ul className="sf-free__list">
                <li>
                  <Check aria-hidden="true" />
                  <span>No Studifree subscription is required for the core local tools.</span>
                </li>
                <li>
                  <Check aria-hidden="true" />
                  <span>No mandatory account stands between you and those tools.</span>
                </li>
                <li>
                  <Check aria-hidden="true" />
                  <span>
                    AI usage depends on your own provider account. Free-tier eligibility is not guaranteed and
                    can change.
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>

          <div className="sf-free__columns">
            <Reveal className="sf-glass sf-free__card" y={18}>
              <div className="sf-free__card-head">
                <h3>Always available</h3>
                <span className="sf-pill">Core tools</span>
              </div>
              <ul className="sf-free__list">
                {freeCoreFeatures.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="sf-free__note">
                <strong>No key needed.</strong> These tools work with local browser storage and do not require
                an AI provider.
              </p>
            </Reveal>

            <Reveal className="sf-glass sf-free__card" delay={0.08} y={18}>
              <div className="sf-free__card-head">
                <h3>Powered by your key</h3>
                <span className="sf-pill">
                  <Sparkles width={11} height={11} aria-hidden="true" /> AI features
                </span>
              </div>
              <ul className="sf-free__list">
                {aiPoweredFeatures.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="sf-free__note">
                <KeyRound width={14} height={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                <strong>Your key, your project.</strong> AI requests are processed by Google Gemini under your
                account. Quotas and pricing are controlled by Google.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
