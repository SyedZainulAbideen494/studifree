import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, HelpCircle, Lightbulb, MessageSquareText } from 'lucide-react'
import { beginnerCopy, beginnerPoints } from '../../data/landing'
import { Reveal, SectionHead } from './shared'

const pointIcons = [HelpCircle, Lightbulb, MessageSquareText] as const

/** Reassurance for first-time users, without condescension. */
export function BeginnerSection() {
  const reduced = useReducedMotion() === true

  return (
    <section className="sf-beginner sf-section" id="beginner" aria-labelledby="beginner-title">
      <div className="sf-container">
        <div className="sf-beginner__layout">
          <div className="sf-beginner__copy">
            <SectionHead
              eyebrow={beginnerCopy.eyebrow}
              id="beginner-title"
              title={beginnerCopy.title}
              description={beginnerCopy.lead}
              meta="SF / CLARITY"
            />

            <div className="sf-beginner__points">
              {beginnerPoints.map((point, index) => {
                const Icon = pointIcons[index]
                return (
                  <Reveal key={point.title} className="sf-beginner__point" delay={index * 0.05}>
                    <span className="sf-beginner__icon" aria-hidden="true">
                      <Icon width={15} height={15} />
                    </span>
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.body}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>

            <p className="sf-beginner__note">{beginnerCopy.note}</p>
          </div>

          <Reveal className="sf-beginner__visual" y={20}>
            <div className="sf-beginner__panel">
              <div className="sf-beginner__panel-head">
                <span>UNDERSTANDING / CHECK</span>
                <span>SF / GUIDE</span>
              </div>

              <div className="sf-beginner__transform" aria-hidden="true">
                <motion.span
                  className="sf-beginner__question"
                  initial={reduced ? false : { opacity: 1, scale: 1 }}
                  whileInView={reduced ? undefined : { opacity: 0.18, scale: 0.82 }}
                  viewport={{ once: true, margin: '-20%' }}
                  transition={{ duration: 0.8, delay: 0.25 }}
                >
                  ?
                </motion.span>

                <motion.span
                  className="sf-beginner__check"
                  initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                  whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-20%' }}
                  transition={{ type: 'spring', stiffness: 210, damping: 18, delay: 0.55 }}
                >
                  <Check width={42} height={42} strokeWidth={1.4} />
                </motion.span>

                <span className="sf-beginner__connector" />
                <span className="sf-beginner__transform-label">CLARITY</span>
              </div>

              <div className="sf-beginner__rows">
                <span>What is an API key?</span>
                <span>Why does it matter?</span>
                <span>How do I use it?</span>
              </div>

              <div className="sf-beginner__footer">
                <span>PLAIN LANGUAGE</span>
                <span>NO ASSUMED KNOWLEDGE</span>
                <span>GUIDED PATH</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
