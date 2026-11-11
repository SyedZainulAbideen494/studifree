import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Layers,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { studyModes, studyModesCopy } from '../../data/landing'
import { Reveal, SectionHead, cx } from './shared'

const icons = [BookOpen, Layers, ClipboardCheck, FileText, MessageCircle] as const

function ModeVisual({ mode }: { mode: (typeof studyModes)[number] }) {
  if (mode.id === 'flashcards') {
    return (
      <div className="sf-mode-visual__flash" aria-hidden="true">
        <span className="sf-mode-visual__flash-meta">BIOLOGY / CARD 07</span>
        <p>What is the difference between mitosis and meiosis?</p>
        <span className="sf-mode-visual__flip">TAP TO REVEAL</span>
        <div className="sf-mode-visual__rating">
          <span>Again</span>
          <span>Hard</span>
          <span className="is-active">Good</span>
          <span>Easy</span>
        </div>
      </div>
    )
  }

  if (mode.id === 'quiz') {
    return (
      <div className="sf-mode-visual__quiz" aria-hidden="true">
        <span className="sf-mode-visual__flash-meta">QUESTION 04 / PRACTICE</span>
        <p>What happens to growth as resources become limited?</p>
        <span className="sf-mode-visual__option">It increases without limit</span>
        <span className="sf-mode-visual__option is-correct">It slows and levels off</span>
        <span className="sf-mode-visual__option">It drops to zero</span>
      </div>
    )
  }

  if (mode.id === 'notes') {
    return (
      <div className="sf-mode-visual__notes" aria-hidden="true">
        <span className="sf-mode-visual__flash-meta">SAVED LESSON / STRUCTURED</span>
        <h4>Cell division — key points</h4>
        <ul>
          <li>Mitosis: growth and repair</li>
          <li>Meiosis: genetic variation</li>
          <li>Common misconception: chromosome number</li>
          <li>Memory hook: PMAT</li>
        </ul>
      </div>
    )
  }

  if (mode.id === 'ask') {
    return (
      <div className="sf-mode-visual__ask" aria-hidden="true">
        <span className="sf-mode-visual__bubble">Why does meiosis create variation?</span>
        <span className="sf-mode-visual__bubble is-ai">
          <Sparkles width={12} height={12} /> Because crossing over and independent assortment shuffle
          genetic material.
        </span>
        <span className="sf-mode-visual__cursor">Ask about anything in this lesson</span>
      </div>
    )
  }

  return (
    <div className="sf-mode-visual__learn" aria-hidden="true">
      <span className="sf-mode-visual__flash-meta">AI PERSONAL TEACHER / EXPLANATION</span>
      <h4>Photosynthesis, in plain words</h4>
      <p>
        A plant uses <span>sunlight</span> to turn carbon dioxide and water into glucose. Oxygen is
        released along the way.
      </p>
      <div className="sf-mode-visual__chips">
        <span>Simpler</span>
        <span>Example</span>
        <span>Deeper</span>
      </div>
    </div>
  )
}

/** Interactive mode switcher with a morphing centre panel. */
export function StudyModes() {
  const [activeId, setActiveId] = useState(studyModes[0].id)
  const reduced = useReducedMotion() === true
  const active = studyModes.find((mode) => mode.id === activeId) ?? studyModes[0]

  return (
    <section className="sf-modes sf-section" id="modes" aria-labelledby="modes-title">
      <div className="sf-container">
        <SectionHead
          eyebrow={studyModesCopy.eyebrow}
          id="modes-title"
          title={studyModesCopy.title}
          description={studyModesCopy.lead}
          meta="SF / MODES"
        />

        <div className="sf-modes__tabs" role="tablist" aria-label="Study modes">
          {studyModes.map((mode, index) => {
            const Icon = icons[index]
            const selected = mode.id === activeId
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="mode-panel"
                className={cx('sf-modes__tab', selected && 'is-active')}
                onClick={() => setActiveId(mode.id)}
              >
                {selected && (
                  <motion.span
                    layoutId="sf-mode-pill"
                    className="sf-modes__tab-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    aria-hidden="true"
                  />
                )}
                <Icon width={14} height={14} aria-hidden="true" />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>

        <div
          className={cx('sf-modes__panel', `is-${active.accent}`)}
          id="mode-panel"
          role="tabpanel"
        >
          <div className="sf-modes__copy">
            <span className="sf-modes__index" aria-hidden="true">
              {String(studyModes.findIndex((mode) => mode.id === active.id) + 1).padStart(2, '0')}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3>{active.title}</h3>
                <p>{active.body}</p>
                <span className="sf-modes__detail">{active.detail}</span>
                <div className="sf-modes__chips">
                  {active.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="sf-modes__visual">
            <div className="sf-modes__visual-head">
              <span>
                <span aria-hidden="true" /> {active.label.toUpperCase()} / PREVIEW
              </span>
              <span>SF / 2026</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="sf-modes__visual-body"
                initial={reduced ? false : { opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <ModeVisual mode={active} />
              </motion.div>
            </AnimatePresence>
            <div className="sf-modes__visual-foot">
              <span>LOCAL STUDY SPACE</span>
              <span>AI OPTIONAL</span>
            </div>
          </div>
        </div>

        <Reveal className="sf-modes__hint">
          <span aria-hidden="true">↳</span>
          Switch modes without losing the thread. The tools are designed to work together.
        </Reveal>
      </div>
    </section>
  )
}
