import React from 'react'
import {
  ArrowUpRight,
  Cloud,
  HardDrive,
  KeyRound,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Video,
} from 'lucide-react'
import { aiKeySteps, securityNotes, youtubeTutorialSearch } from '../../data/landing'
import { useAiUiStore } from '../../store/useAiUiStore'
import { LandingLink, Reveal, SectionHead, TextLink } from './shared'

const securityIcons = [HardDrive, Cloud, KeyRound, Server]

const shortVersion = [
  'Open Google AI Studio and sign in.',
  'Create an API key and copy it.',
  'Paste it into Studifree AI Setup.',
  'Test the connection.',
  'Use AI features when you need them.',
]

/**
 * AI setup, framed as a small operations console. The steps stay plain and
 * approachable; the surrounding surfaces make the optional nature of AI
 * explicit.
 */
export function ApiKeyGuide() {
  const openSetup = useAiUiStore((state) => state.openSetup)

  return (
    <section className="sf-section sf-keys" id="api-keys" aria-labelledby="api-keys-title">
      <div className="sf-container">
        <div className="sf-keys__head">
          <Reveal>
            <SectionHead
              eyebrow="AI setup & security"
              meta="06 / KEY"
              title={<span id="api-keys-title">Your key. Your control.</span>}
              description="AI is optional. If you want to use it, connect a Google Gemini API key from your own AI Studio project. The setup is short, and you do not need to write code."
            />
          </Reveal>

          <Reveal className="sf-keys__aside" delay={0.08} y={16}>
            <span className="sf-keys__optional">
              <Sparkles width={12} height={12} aria-hidden="true" />
              Optional module
            </span>
            <p>
              The core tools do not need this. Add a key only when you want AI explanations, generated
              flashcards, quizzes or structured notes.
            </p>
          </Reveal>
        </div>

        <div className="sf-keys__layout">
          <ol className="sf-keys__steps">
            {aiKeySteps.map((step, index) => (
              <li className="sf-keys__step" key={step.number}>
                <Reveal y={18} delay={0.05 * index}>
                  <span className="sf-keys__step-number" aria-hidden="true">
                    {step.number}
                  </span>
                  <div className="sf-keys__step-body">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    <TextLink href={step.action.href} showArrow={!step.action.external}>
                      {step.action.label}
                      {step.action.external ? (
                        <ArrowUpRight width={13} height={13} aria-hidden="true" />
                      ) : null}
                    </TextLink>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="sf-keys__console" delay={0.08} y={20}>
            <div className="sf-keys__console-bar">
              <span className="sf-keys__console-title">
                <Terminal width={12} height={12} aria-hidden="true" />
                SF / AI SETUP
              </span>
              <span className="sf-keys__console-status">
                <span aria-hidden="true" />
                READY
              </span>
            </div>

            <div className="sf-keys__console-body">
              <p className="sf-eyebrow">The short version</p>
              <h3>Five lines. One connection.</h3>

              <ol className="sf-keys__short">
                {shortVersion.map((line, index) => (
                  <li key={line}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {line}
                  </li>
                ))}
              </ol>

              <div className="sf-keys__console-actions">
                <button type="button" className="sf-btn sf-btn--primary sf-btn--sm" onClick={openSetup}>
                  <Sparkles width={15} height={15} aria-hidden="true" />
                  Open the illustrated guide
                </button>
                <LandingLink href="/ai-setup" variant="secondary" size="sm" showArrow>
                  Open AI Setup
                </LandingLink>
              </div>

              <p className="sf-keys__console-note">
                <ShieldCheck width={14} height={14} aria-hidden="true" />
                <span>
                  <strong>Keep the key private.</strong> Treat it like a password. The browser can store it
                  for convenience, but it cannot be guaranteed secret.
                </span>
              </p>
            </div>

            <div className="sf-keys__console-foot">
              <span>PROVIDER / GOOGLE GEMINI</span>
              <span className="sf-keys__console-meter" aria-hidden="true">
                <span />
              </span>
              <span>YOUR PROJECT</span>
            </div>
          </Reveal>
        </div>

        <div className="sf-keys__security">
          <Reveal className="sf-keys__security-head">
            <p className="sf-eyebrow">Honest security</p>
            <h3 className="sf-h3">Clear about what can and cannot be protected.</h3>
            <p className="sf-body">
              Local-first is useful, but it is not magic. Here is the straightforward version.
            </p>
          </Reveal>

          <div className="sf-keys__notes">
            {securityNotes.map((note, index) => {
              const Icon = securityIcons[index] ?? ShieldCheck
              return (
                <Reveal className="sf-keys__note" key={note.title} delay={0.04 * index} y={16}>
                  <div className="sf-keys__note-head">
                    <Icon width={16} height={16} aria-hidden="true" />
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h4>{note.title}</h4>
                  <p>{note.body}</p>
                </Reveal>
              )
            })}
          </div>
        </div>

        <Reveal className="sf-keys__foot" y={10}>
          <div className="sf-actions">
            <LandingLink href="/help" variant="secondary" showArrow>
              Visit the Help Centre
            </LandingLink>
            <a
              className="sf-text-link"
              href={youtubeTutorialSearch}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Video width={14} height={14} aria-hidden="true" /> YouTube walkthroughs
            </a>
          </div>
          <p className="sf-small">
            Beginner friendly. No technical knowledge required. Official Google pages are linked above.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
