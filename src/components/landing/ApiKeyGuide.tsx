import React from 'react'
import {
  ArrowUpRight,
  Cloud,
  HardDrive,
  KeyRound,
  Server,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react'
import { aiKeySteps, securityNotes, youtubeTutorialSearch } from '../../data/landing'
import { useAiUiStore } from '../../store/useAiUiStore'
import { LandingLink, Reveal, SectionHead, TextLink } from './shared'

const securityIcons = [HardDrive, Cloud, KeyRound, Server]

export function ApiKeyGuide() {
  const openSetup = useAiUiStore((state) => state.openSetup)

  return (
    <section className="sf-section" id="api-keys" aria-labelledby="api-keys-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="AI setup & security"
            title={<span id="api-keys-title">Your key. Your control.</span>}
            description="AI is optional. If you want to use it, connect a Google Gemini API key from your own AI Studio project. The setup is short, and you do not need to write code."
          />
        </Reveal>

        <div className="sf-steps">
          {aiKeySteps.map((step, index) => (
            <Reveal className="sf-step" key={step.number} delay={0.07 * index} y={18}>
              <span className="sf-step__number" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <div className="sf-step__detail">
                <LandingLink href={step.action.href} variant="ghost" size="sm" showArrow>
                  {step.action.label}
                </LandingLink>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="sf-intro" delay={0.06} y={18}>
          <div className="sf-intro__copy">
            <p className="sf-eyebrow">Beginner friendly</p>
            <h3 className="sf-h3">No technical knowledge needed.</h3>
            <p className="sf-body">
              Sign in with your Google account, create a key, copy it, and paste it into Studifree AI Setup.
              The app tests the connection and tells you if something is wrong. If you get stuck, the Help
              Centre and the illustrated guide cover the same steps with screenshots of the flow.
            </p>
            <div className="sf-actions">
              <button type="button" className="sf-btn sf-btn--secondary" onClick={openSetup}>
                <Sparkles width={16} height={16} aria-hidden="true" />
                Open the illustrated guide
              </button>
              <LandingLink href="/ai-setup" variant="primary" showArrow>
                Open AI Setup
              </LandingLink>
            </div>
            <TextLink href={youtubeTutorialSearch} className="sf-small">
              <Video width={14} height={14} aria-hidden="true" /> Search beginner walkthroughs on YouTube
            </TextLink>
          </div>

          <div className="sf-glass sf-glass--flat sf-free__card">
            <div className="sf-free__card-head">
              <h3>The short version</h3>
              <span className="sf-pill">5 steps</span>
            </div>
            <ol className="sf-free__list" style={{ counterReset: 'step' }}>
              {[
                'Open Google AI Studio and sign in.',
                'Create an API key and copy it.',
                'Paste it into Studifree AI Setup.',
                'Test the connection.',
                'Start using AI features when you need them.',
              ].map((line, index) => (
                <li key={line}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.16)',
                      fontSize: '0.56rem',
                      color: 'var(--sf-silver)',
                      flex: '0 0 auto',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <p className="sf-free__note">
              <strong>Keep the key private.</strong> Treat it like a password. The browser can store it for
              convenience, but it cannot be guaranteed secret.
            </p>
          </div>
        </Reveal>

        <Reveal style={{ marginTop: 'clamp(48px, 7vw, 84px)' }} y={18}>
          <SectionHead
            eyebrow="Honest security"
            title="Clear about what can and cannot be protected."
            description="Local-first is useful, but it is not magic. Here is the straightforward version."
          />
        </Reveal>

        <div className="sf-safety">
          {securityNotes.map((note, index) => {
            const Icon = securityIcons[index] ?? ShieldCheck
            return (
              <Reveal
                className="sf-glass sf-glass--flat sf-safety__card"
                key={note.title}
                delay={0.05 * index}
                y={16}
              >
                <Icon
                  width={18}
                  height={18}
                  aria-hidden="true"
                  style={{ marginBottom: 12, color: 'var(--sf-silver)' }}
                />
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="sf-actions" style={{ marginTop: 28 }} y={10}>
          <LandingLink href="/help" variant="secondary" showArrow>
            Visit the Help Centre
          </LandingLink>
          <a
            className="sf-text-link"
            href={youtubeTutorialSearch}
            target="_blank"
            rel="noreferrer noopener"
          >
            YouTube walkthroughs <ArrowUpRight width={14} height={14} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
