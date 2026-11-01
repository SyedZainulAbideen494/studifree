import React from 'react'
import { Reveal } from './shared'

export function CreatorStory() {
  return (
    <section className="sf-section sf-creator" id="story" aria-labelledby="story-title">
      <div className="sf-container">
        <div className="sf-creator__layout">
          <Reveal className="sf-creator__aside">
            <p className="sf-eyebrow">Why Studifree exists</p>
            <p className="sf-creator__quote">
              “Learning should not feel like a subscription maze.”
            </p>
            <div className="sf-creator__signature">
              <span className="sf-dot" aria-hidden="true" />
              <span>Independent project · no education-board affiliation</span>
            </div>
          </Reveal>

          <div className="sf-creator__body">
            <Reveal>
              <h2 className="sf-h3" id="story-title">
                A small project with a clear purpose.
              </h2>
            </Reveal>

            <Reveal delay={0.04}>
              <p>
                Studifree began as a personal learning project. The aim was simple: bring the useful parts of
                studying — explanation, recall, practice and planning — into one calm space instead of
                scattering them across a dozen tabs.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <p>
                Many learning platforms ask you to buy into their ecosystem first. Studifree tries a different
                shape: keep the core local tools free, and make AI an optional connection you control with
                your own provider key. That way the product can be useful even when you do not want another
                subscription.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <p>
                The trade-offs are real. Local data does not sync itself. A key stored in a browser cannot be
                guaranteed secret. AI can be confidently wrong. Those limits belong in the product and on this
                page, not in a footnote.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p>
                Studifree is independent and not affiliated with any examination board, school or education
                authority. It is not designed to replace a teacher. It is designed to make the next study
                session a little clearer.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
