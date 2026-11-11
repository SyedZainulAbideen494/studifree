import React from 'react'
import { Scale } from 'lucide-react'
import { freeCopy, freePoints } from '../../data/landing'
import { Reveal } from './shared'

/** The honest answer to “why is this free?” */
export function FreeSection() {
  return (
    <section className="sf-free sf-section" id="why-free" aria-labelledby="free-title">
      <div className="sf-free__glow" aria-hidden="true" />
      <div className="sf-container">
        <div className="sf-free__top">
          <p className="sf-label">{freeCopy.eyebrow}</p>
          <h2 className="sf-free__title" id="free-title">
            {freeCopy.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>

        <div className="sf-free__layout">
          <Reveal className="sf-free__lead" y={20}>
            <span className="sf-free__scale" aria-hidden="true">
              <Scale width={20} height={20} />
            </span>
            <p>{freeCopy.lead}</p>
          </Reveal>

          <div className="sf-free__points">
            {freePoints.map((point, index) => (
              <Reveal key={point.number} className="sf-free__point" delay={index * 0.05}>
                <span className="sf-free__point-number">{point.number}</span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="sf-free__note">
          <span aria-hidden="true">i</span>
          <p>{freeCopy.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
