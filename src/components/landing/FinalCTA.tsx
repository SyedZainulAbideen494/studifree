import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { finalCtaCopy } from '../../data/landing'
import { LandingLink, Reveal } from './shared'

const chips = [
  { className: 'sf-final__chip--one', label: 'Understand' },
  { className: 'sf-final__chip--two', label: 'Recall' },
  { className: 'sf-final__chip--three', label: 'Practise' },
  { className: 'sf-final__chip--four', label: 'Plan' },
]

const lineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const line = {
  hidden: { y: '112%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] as const },
  },
}

/**
 * Closing act. The title is split for a line-by-line reveal, while the
 * accessible name stays the exact sentence.
 */
export function FinalCTA() {
  const reduced = useReducedMotion() === true

  return (
    <section className="sf-final" id="start" aria-labelledby="final-title">
      <div className="sf-final__ambient" aria-hidden="true">
        <div className="sf-final__grid" />
        <div className="sf-final__orb sf-final__orb--one" />
        <div className="sf-final__orb sf-final__orb--two" />
      </div>

      <div className="sf-final__chips" aria-hidden="true">
        {chips.map((chip) => (
          <span key={chip.label} className={`sf-final__chip ${chip.className}`}>
            <span />
            {chip.label}
          </span>
        ))}
      </div>

      <div className="sf-container">
        <div className="sf-final__inner">
          <Reveal className="sf-final__meta" y={10}>
            <span className="sf-eyebrow">{finalCtaCopy.eyebrow}</span>
            <span className="sf-final__meta-code">10 / BEGIN</span>
          </Reveal>

          <motion.h2
            className="sf-final__title"
            id="final-title"
            aria-label={finalCtaCopy.title}
            variants={lineContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="sf-final__line" aria-hidden="true">
              <motion.span variants={reduced ? undefined : line}>YOUR NEXT</motion.span>
            </span>
            <span className="sf-final__line" aria-hidden="true">
              <motion.span variants={reduced ? undefined : line}>CHAPTER STARTS</motion.span>
            </span>
            <span className="sf-final__line" aria-hidden="true">
              <motion.span className="sf-final__title-accent" variants={reduced ? undefined : line}>
                HERE.
              </motion.span>
            </span>
          </motion.h2>

          <Reveal delay={0.12} y={14}>
            <p className="sf-final__text">{finalCtaCopy.description}</p>
          </Reveal>

          <Reveal className="sf-actions sf-final__actions" delay={0.16} y={12}>
            <LandingLink href="/home" variant="primary" size="lg" showArrow>
              {finalCtaCopy.primaryCta}
            </LandingLink>
            <LandingLink href="#product" variant="secondary" size="lg">
              {finalCtaCopy.secondaryCta}
            </LandingLink>
          </Reveal>

          <Reveal delay={0.2} y={10}>
            <p className="sf-final__note">{finalCtaCopy.note}</p>
          </Reveal>

          <Reveal className="sf-final__foot" delay={0.24} y={8}>
            <span aria-hidden="true" />
            <span>SF / 2026 / LEARNING INTELLIGENCE</span>
            <span aria-hidden="true" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
