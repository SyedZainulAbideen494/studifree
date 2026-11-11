import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Check, FileText, RotateCcw, Sparkles } from 'lucide-react'
import { howItWorksCopy, howItWorksSteps } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

function StepVisual({ step }: { step: (typeof howItWorksSteps)[number] }) {
  if (step.number === '01') {
    return (
      <div className="sf-how__material" aria-hidden="true">
        <div className="sf-how__file">
          <span className="sf-how__file-type">PDF</span>
          <span className="sf-how__file-lines">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sf-how__file-size">2.4 MB</span>
        </div>
        <span className="sf-how__drop">DROP OR SELECT</span>
      </div>
    )
  }

  if (step.number === '02') {
    return (
      <div className="sf-how__transform" aria-hidden="true">
        <span className="sf-how__node">
          <Sparkles width={16} height={16} />
          AI
        </span>
        <span className="sf-how__orbit" />
        <div className="sf-how__outputs">
          <span>Explanations</span>
          <span>Flashcards</span>
          <span>Quizzes</span>
          <span>Notes</span>
        </div>
      </div>
    )
  }

  if (step.number === '03') {
    return (
      <div className="sf-how__study" aria-hidden="true">
        <div className="sf-how__flashcard">
          <span>QUESTION</span>
          <p>Why does retrieval strengthen memory?</p>
          <em>Tap to reveal</em>
        </div>
        <div className="sf-how__rating">
          <span>Again</span>
          <span>Hard</span>
          <span className="is-active">Good</span>
          <span>Easy</span>
        </div>
      </div>
    )
  }

  return (
    <div className="sf-how__remember" aria-hidden="true">
      <div className="sf-how__ring">
        <span>84</span>
        <em>%</em>
      </div>
      <div className="sf-how__reviews">
        <span>
          <Check width={11} height={11} /> 12 cards due
        </span>
        <span>
          <RotateCcw width={11} height={11} /> 4 topics to revisit
        </span>
        <span>
          <FileText width={11} height={11} /> 2 saved lessons
        </span>
      </div>
    </div>
  )
}

/**
 * Desktop uses a pinned horizontal story; mobile falls back to a vertical
 * sequence. The track is translated with a CSS calc of scroll progress so the
 * final card always lands at the right edge, regardless of card width.
 */
export function HowItWorks() {
  const pinRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() === true
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 32, mass: 0.35 })

  return (
    <section className="sf-how" id="how-it-works" aria-labelledby="how-title">
      <div className="sf-how__pin" ref={pinRef}>
        <div className="sf-how__sticky">
          <div className="sf-container sf-how__head">
            <SectionHead
              eyebrow={howItWorksCopy.eyebrow}
              id="how-title"
              title={howItWorksCopy.title}
              description={howItWorksCopy.lead}
              meta="SF / LOOP"
            />
            <span className="sf-how__counter" aria-hidden="true">
              04 STEPS / ONE LOOP
            </span>
          </div>

          <div className="sf-how__viewport">
            <motion.div
              className="sf-how__track"
              style={
                reduced
                  ? undefined
                  : ({ '--sf-how-progress': progress } as React.CSSProperties)
              }
            >
              {howItWorksSteps.map((step) => (
                <article className="sf-how__step" key={step.number}>
                  <div className="sf-how__step-top">
                    <span className="sf-how__step-number">{step.number}</span>
                    <span className="sf-how__step-kicker">{step.kicker}</span>
                  </div>

                  <StepVisual step={step} />

                  <div className="sf-how__step-copy">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    <span className="sf-how__step-detail">{step.detail}</span>
                  </div>

                  <ArrowUpRight className="sf-how__step-arrow" width={16} height={16} aria-hidden="true" />
                </article>
              ))}
            </motion.div>
          </div>

          <div className="sf-container sf-how__rail" aria-hidden="true">
            <span className="sf-how__rail-line">
              <motion.span style={{ scaleX: reduced ? 1 : progress }} />
            </span>
            <span>START → REMEMBER</span>
          </div>
        </div>
      </div>

      <Reveal className="sf-container sf-how__mobile-note">
        <span aria-hidden="true">↳</span>
        Four steps, one continuous loop. Each tool feeds the next.
      </Reveal>
    </section>
  )
}
