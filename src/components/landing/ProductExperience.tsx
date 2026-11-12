import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Check, FileText, Layers, Sparkles } from 'lucide-react'
import { productCopy } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

function TeacherPanel() {
  return (
    <div className="sf-app sf-app--teacher">
      <div className="sf-app__bar">
        <span className="sf-app__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-app__bar-title">AI Personal Teacher</span>
        <span className="sf-app__bar-status">
          <span aria-hidden="true" /> LIVE
        </span>
      </div>
      <div className="sf-app__body">
        <div className="sf-chat__user">
          <span className="sf-chat__avatar" aria-hidden="true">
            YOU
          </span>
          <p>Explain photosynthesis like I’m new to biology.</p>
        </div>

        <div className="sf-chat__ai">
          <span className="sf-chat__spark" aria-hidden="true">
            <Sparkles width={14} height={14} />
          </span>
          <div>
            <p className="sf-chat__eyebrow">STUDIFREE / EXPLANATION</p>
            <h4>Photosynthesis, in plain words</h4>
            <p>
              A plant uses <span className="sf-hl">sunlight</span> to turn carbon dioxide and water
              into glucose. Oxygen is released along the way.
            </p>
            <p className="sf-chat__muted">
              Think of a leaf as a tiny kitchen: light is the stove, water and air are the
              ingredients, and glucose is the meal the plant keeps for energy.
            </p>
            <div className="sf-chat__chips">
              <span>Chlorophyll</span>
              <span>Light reactions</span>
              <span>Glucose</span>
            </div>
          </div>
        </div>

        <div className="sf-chat__followup">
          <Sparkles width={13} height={13} aria-hidden="true" />
          Ask a follow-up · Make it simpler · Give an example
        </div>
      </div>
    </div>
  )
}

function FlashcardLayer() {
  return (
    <div className="sf-mini-card sf-mini-card--flashcard">
      <div className="sf-mini-card__head">
        <span>
          <Layers width={13} height={13} aria-hidden="true" /> FLASHCARD
        </span>
        <span>07 / 24</span>
      </div>
      <p className="sf-mini-card__question">
        What is the difference between mitosis and meiosis?
      </p>
      <span className="sf-mini-card__hint">Tap to reveal the answer</span>
      <div className="sf-mini-card__progress" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

function QuizLayer() {
  return (
    <div className="sf-mini-card sf-mini-card--quiz">
      <div className="sf-mini-card__head">
        <span>QUIZ / PRACTICE</span>
        <span>QUESTION 4</span>
      </div>
      <p className="sf-mini-card__question">
        What happens to population growth as resources become limited?
      </p>
      <ul className="sf-quiz-options">
        <li>
          <span>It increases without limit</span>
          <span className="sf-quiz-options__key">A</span>
        </li>
        <li className="is-selected">
          <span>It slows and levels off</span>
          <span className="sf-quiz-options__key">
            <Check width={11} height={11} aria-hidden="true" /> B
          </span>
        </li>
        <li>
          <span>It drops to zero</span>
          <span className="sf-quiz-options__key">C</span>
        </li>
      </ul>
      <div className="sf-mini-card__result">
        <span>Correct</span>
        <span>Explanation available</span>
      </div>
    </div>
  )
}

function NotesLayer() {
  return (
    <div className="sf-mini-card sf-mini-card--notes">
      <div className="sf-mini-card__head">
        <span>
          <FileText width={13} height={13} aria-hidden="true" /> NOTES
        </span>
        <span>SAVED</span>
      </div>
      <h4>Cell division — key points</h4>
      <ul>
        <li>Mitosis: growth and repair</li>
        <li>Meiosis: genetic variation</li>
        <li>Check: chromosome number</li>
      </ul>
      <span className="sf-mini-card__hint">Structured. Revisitable. Yours.</span>
    </div>
  )
}

/** Floating product montage: one main workspace with study layers around it. */
export function ProductExperience() {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() === true
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })

  const mainY = useTransform(scrollYProgress, [0, 1], [60, reduced ? 0 : -40])
  const cardY = useTransform(scrollYProgress, [0, 1], [110, reduced ? 0 : -80])
  const notesY = useTransform(scrollYProgress, [0, 1], [40, reduced ? 0 : -120])
  const rotate = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -2.5, reduced ? 0 : 1.5])

  return (
    <section className="sf-product sf-section" id="product" aria-labelledby="product-title">
      <div className="sf-container">
        <SectionHead
          eyebrow={productCopy.eyebrow}
          id="product-title"
          title={productCopy.title}
          description={productCopy.lead}
        />

        <div className="sf-product__stage" ref={stageRef}>
          <div className="sf-product__beam" aria-hidden="true" />

          <motion.div className="sf-product__main" style={{ y: mainY, rotate }}>
            <TeacherPanel />
          </motion.div>

          <motion.div className="sf-product__card sf-product__card--flash" style={{ y: cardY }}>
            <FlashcardLayer />
          </motion.div>

          <motion.div className="sf-product__card sf-product__card--quiz" style={{ y: notesY }}>
            <QuizLayer />
          </motion.div>

          <motion.div className="sf-product__card sf-product__card--notes" style={{ y: notesY }}>
            <NotesLayer />
          </motion.div>
        </div>

        <Reveal className="sf-product__caption">{productCopy.caption}</Reveal>
      </div>
    </section>
  )
}
