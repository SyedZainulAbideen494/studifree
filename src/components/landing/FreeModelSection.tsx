import React from 'react'
import { Check, KeyRound, Sparkles } from 'lucide-react'
import { aiPoweredFeatures, freeCoreFeatures } from '../../data/landing'
import { LandingLink, Reveal, SectionHead } from './shared'

const terms = [
  {
    index: 'A',
    title: 'No subscription to an AI allowance',
    body: 'Studifree does not resell model access. AI usage is billed by your provider, under your own project.',
  },
  {
    index: 'B',
    title: 'No mandatory account',
    body: 'Supported local tools open without a sign-in wall. There is no account standing between you and your notes.',
  },
  {
    index: 'C',
    title: 'No hidden “unlimited” promise',
    body: 'Provider quotas, eligible free tiers and pricing can change. This page describes the model as it works today.',
  },
]

function FeatureList({ items, start = 1 }: { items: string[]; start?: number }) {
  return (
    <ul className="sf-access__list">
      {items.map((feature, index) => (
        <li key={feature}>
          <span className="sf-access__list-index" aria-hidden="true">
            {String(index + start).padStart(2, '0')}
          </span>
          <Check aria-hidden="true" strokeWidth={1.8} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * The access model, presented as a specification sheet rather than a pricing
 * table. Two clearly separated capability columns, then the plain-language
 * terms underneath.
 */
export function FreeModelSection() {
  return (
    <section className="sf-section sf-access" id="free" aria-labelledby="free-title">
      <div className="sf-container">
        <div className="sf-access__head">
          <Reveal>
            <SectionHead
              eyebrow="Free core · bring your own AI key"
              meta="05 / ACCESS"
              title={<span id="free-title">A transparent way to use AI.</span>}
              description="Studifree does not sell a subscription to an AI allowance. The core learning tools are free, and AI features connect directly to your own Google AI Studio project."
            />
          </Reveal>

          <Reveal className="sf-access__aside" delay={0.08} y={16}>
            <p className="sf-body">
              You choose whether you need AI, you control the key, and Google’s current quotas and pricing
              apply to your own project. There is no shared Studifree AI pool.
            </p>
            <div className="sf-actions">
              <LandingLink href="#api-keys" variant="secondary" size="sm" showArrow>
                See AI setup
              </LandingLink>
              <LandingLink href="/home" variant="primary" size="sm" showArrow>
                Start learning
              </LandingLink>
            </div>
          </Reveal>
        </div>

        <div className="sf-access__panels">
          <Reveal className="sf-access__panel" y={20}>
            <div className="sf-access__panel-head">
              <div>
                <span className="sf-access__panel-code">00 / CORE</span>
                <h3>Always available</h3>
              </div>
              <span className="sf-access__badge">No key needed</span>
            </div>

            <FeatureList items={freeCoreFeatures} />

            <p className="sf-access__note">
              <strong>Local by default.</strong> These tools work with browser storage and do not require an AI
              provider.
            </p>
          </Reveal>

          <Reveal className="sf-access__panel sf-access__panel--ai" delay={0.08} y={20}>
            <div className="sf-access__panel-head">
              <div>
                <span className="sf-access__panel-code">01 / AI</span>
                <h3>Powered by your key</h3>
              </div>
              <span className="sf-access__badge sf-access__badge--icon">
                <KeyRound width={11} height={11} aria-hidden="true" />
                Your project
              </span>
            </div>

            <FeatureList items={aiPoweredFeatures} />

            <p className="sf-access__note">
              <Sparkles width={13} height={13} aria-hidden="true" />
              <span>
                <strong>Your key, your project.</strong> AI requests are processed by Google Gemini under
                your account. Quotas and pricing are controlled by Google.
              </span>
            </p>
          </Reveal>
        </div>

        <Reveal className="sf-access__terms" delay={0.04} y={14}>
          {terms.map((term) => (
            <div className="sf-access__term" key={term.index}>
              <span className="sf-access__term-index" aria-hidden="true">
                {term.index}
              </span>
              <h4>{term.title}</h4>
              <p>{term.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
