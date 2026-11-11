import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { founderCopy } from '../../data/landing'
import { Reveal } from './shared'

function Signature() {
  const reduced = useReducedMotion() === true

  return (
    <svg className="sf-founder__signature" viewBox="0 0 220 64" role="img" aria-label="Signature of Syed Zain-ul Abideen">
      <motion.path
        d="M8 47c14-9 20-22 24-33 4 17 3 29-4 38 14-12 26-20 34-19 9 1 4 15-2 19 12-13 21-18 29-16 10 3 3 13-4 17 17-10 29-14 38-11 10 3 7 11-2 12 20-10 34-14 45-10 9 3 10 10 2 11"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <motion.path
        d="M14 55h192"
        fill="none"
        stroke="rgba(79,140,255,0.5)"
        strokeWidth="0.8"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={reduced ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.9 }}
      />
    </svg>
  )
}

/** Personal note. Quiet, first-person, and free of invented credentials. */
export function FounderSection() {
  return (
    <section className="sf-founder sf-section" id="founder" aria-labelledby="founder-title">
      <div className="sf-container">
        <Reveal className="sf-founder__panel" y={22}>
          <div className="sf-founder__aside">
            <p className="sf-label">{founderCopy.eyebrow}</p>
            <h2 className="sf-founder__title" id="founder-title">
              {founderCopy.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <span className="sf-founder__mark" aria-hidden="true">
              <PenLine width={16} height={16} />
              HUMAN NOTE
            </span>
          </div>

          <div className="sf-founder__body">
            <div className="sf-founder__text">
              {founderCopy.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <Signature />

            <div className="sf-founder__identity">
              <span className="sf-founder__name">{founderCopy.name}</span>
              <span className="sf-founder__role">{founderCopy.role}</span>
            </div>

            <p className="sf-founder__note">{founderCopy.signatureNote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
