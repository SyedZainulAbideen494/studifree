import React from 'react'
import { ArrowUpRight, Key, Lock, Play, ShieldCheck } from 'lucide-react'
import {
  aiKeyBenefits,
  aiKeyCopy,
  aiKeySteps,
  tutorialHref,
} from '../../data/landing'
import { Reveal, SectionHead, TextLink } from './shared'

/** Bring-your-own-key explainer, written for people who have never made a key. */
export function AiKeySection() {
  return (
    <section className="sf-key sf-section" id="ai-key" aria-labelledby="key-title">
      <div className="sf-container">
        <div className="sf-key__layout">
          <div className="sf-key__copy">
            <SectionHead
              eyebrow={aiKeyCopy.eyebrow}
              id="key-title"
              title={
                <>
                  {aiKeyCopy.title.map((line) => (
                    <span key={line} className="sf-key__title-line">
                      {line}
                    </span>
                  ))}
                </>
              }
              description={aiKeyCopy.lead}
              meta="SF / BYOK"
            />

            <div className="sf-key__benefits">
              {aiKeyBenefits.map((benefit, index) => (
                <Reveal key={benefit.title} className="sf-key__benefit" delay={index * 0.05}>
                  <span className="sf-key__benefit-icon" aria-hidden="true">
                    {index === 0 ? (
                      <Key width={15} height={15} />
                    ) : index === 1 ? (
                      <ShieldCheck width={15} height={15} />
                    ) : (
                      <Lock width={15} height={15} />
                    )}
                  </span>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="sf-key__reassurance">{aiKeyCopy.reassurance}</p>

            <div className="sf-key__actions">
              <a
                className="sf-btn sf-btn--primary"
                href={aiKeySteps[0].action.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="sf-btn__label">{aiKeyCopy.primaryCta}</span>
                <span className="sf-btn__arrow" aria-hidden="true">
                  <ArrowUpRight width={15} height={15} />
                </span>
              </a>
              <a
                className="sf-btn sf-btn--secondary"
                href={tutorialHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Play width={13} height={13} aria-hidden="true" />
                <span className="sf-btn__label">{aiKeyCopy.secondaryCta}</span>
              </a>
            </div>

            <p className="sf-key__footnote">
              {aiKeyCopy.footnote} <TextLink href="/ai-setup">Open AI Setup</TextLink>
            </p>
          </div>

          <Reveal className="sf-key__visual" y={22}>
            <div className="sf-key__console">
              <div className="sf-key__console-bar">
                <span className="sf-key__console-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span>AI SETUP / CONNECTION</span>
                <span className="sf-key__console-state">
                  <span aria-hidden="true" /> READY
                </span>
              </div>

              <div className="sf-key__console-body">
                <div className="sf-key__key-card">
                  <span className="sf-key__key-icon" aria-hidden="true">
                    <Key width={17} height={17} />
                  </span>
                  <div>
                    <span>YOUR PROVIDER KEY</span>
                    <strong>AIza••••••••••••••••</strong>
                  </div>
                  <span className="sf-key__key-badge">PRIVATE</span>
                </div>

                <div className="sf-key__signal" aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <span key={index} style={{ height: `${18 + ((index * 37) % 64)}%` }} />
                  ))}
                </div>

                <ol className="sf-key__steps">
                  {aiKeySteps.map((step) => (
                    <li key={step.number}>
                      <span className="sf-key__step-number">{step.number}</span>
                      <div>
                        <h4>{step.title}</h4>
                        <p>{step.body}</p>
                        <a
                          href={step.action.href}
                          target={step.action.external ? '_blank' : undefined}
                          rel={step.action.external ? 'noreferrer noopener' : undefined}
                        >
                          {step.action.label} <ArrowUpRight width={11} height={11} aria-hidden="true" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="sf-key__console-footer">
                  <span>CONNECTION TEST</span>
                  <span className="sf-key__test">● PASSED</span>
                  <span>QUOTA / YOUR PROJECT</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
