import React from 'react'
import { AlertTriangle, ArrowDown, CheckCircle2, Cpu, GitBranch, RefreshCw } from 'lucide-react'
import { fallbackCopy, fallbackSteps } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

const icons = [Cpu, AlertTriangle, GitBranch, RefreshCw, CheckCircle2] as const

/** Futuristic command-centre view of the configured model fallback chain. */
export function ModelFallback() {
  return (
    <section className="sf-fallback sf-section" id="fallback" aria-labelledby="fallback-title">
      <div className="sf-container">
        <div className="sf-fallback__head">
          <SectionHead
            eyebrow={fallbackCopy.eyebrow}
            id="fallback-title"
            title={
              <>
                {fallbackCopy.title.map((line) => (
                  <span key={line} className="sf-fallback__title-line">
                    {line}
                  </span>
                ))}
              </>
            }
            description={fallbackCopy.lead}
            meta="SF / RESILIENCE"
          />
          <span className="sf-fallback__status">
            <span aria-hidden="true" /> FALLBACK READY
          </span>
        </div>

        <div className="sf-fallback__console">
          <div className="sf-fallback__console-bar">
            <span>MODEL ROUTER / LIVE</span>
            <span className="sf-fallback__console-path">SF-01 → POLICY → NEXT</span>
          </div>

          <div className="sf-fallback__pipeline">
            <span className="sf-fallback__rail" aria-hidden="true">
              <span className="sf-fallback__pulse" />
            </span>

            {fallbackSteps.map((step, index) => {
              const Icon = icons[index]
              const state =
                index === 1 ? 'error' : index === 2 ? 'policy' : index === 4 ? 'success' : 'default'
              return (
                <Reveal
                  key={step.id}
                  className={`sf-fallback__step is-${state}`}
                  delay={index * 0.06}
                >
                  <div className="sf-fallback__step-head">
                    <span className="sf-fallback__icon" aria-hidden="true">
                      <Icon width={14} height={14} />
                    </span>
                    <span className="sf-fallback__state">{step.state}</span>
                  </div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                  {index < fallbackSteps.length - 1 && (
                    <span className="sf-fallback__arrow" aria-hidden="true">
                      {index === 3 ? <ArrowDown width={12} height={12} /> : <ArrowDown width={12} height={12} />}
                    </span>
                  )}
                </Reveal>
              )
            })}
          </div>

          <div className="sf-fallback__console-footer">
            <span>CONFIGURED CHAIN</span>
            <span>MODEL A → MODEL B → MODEL C</span>
            <span>USER CONTROL</span>
          </div>
        </div>

        <Reveal className="sf-fallback__note">
          <AlertTriangle width={14} height={14} aria-hidden="true" />
          <p>{fallbackCopy.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
