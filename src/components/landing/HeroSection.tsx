import React from 'react'
import { heroCopy } from '../../data/landing'
import { LandingLink, Reveal } from './shared'
import {
  HeroFlashcardCard,
  HeroLessonCard,
  HeroPlannerCard,
  HeroProgressCard,
  HeroQuizCard,
} from './ProductPreviews'

export function HeroSection() {
  return (
    <section className="sf-hero" id="top" aria-labelledby="hero-title">
      <div className="sf-container">
        <div className="sf-hero__grid">
          <Reveal className="sf-hero__copy">
            <p className="sf-eyebrow">{heroCopy.eyebrow}</p>

            <h1 className="sf-display sf-hero__title" id="hero-title">
              {heroCopy.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>

            <p className="sf-lead sf-hero__description">{heroCopy.description}</p>

            <div className="sf-actions">
              <LandingLink href="/home" variant="primary" size="lg" showArrow>
                {heroCopy.primaryCta}
              </LandingLink>
              <LandingLink href="#how-it-works" variant="secondary" size="lg">
                {heroCopy.secondaryCta}
              </LandingLink>
            </div>

            <p className="sf-hero__trust">
              <span className="sf-dot" aria-hidden="true" />
              {heroCopy.trust}
            </p>
          </Reveal>

          <Reveal className="sf-hero__visual" delay={0.14} y={18}>
            <div className="sf-hero__stage" aria-hidden="true">
              <div className="sf-hero__halo" />
              <div className="sf-hero__ring" />

              <div className="sf-hero-panel sf-hero-panel--lesson sf-float">
                <HeroLessonCard />
              </div>

              <div className="sf-hero-panel sf-hero-panel--flashcard sf-float sf-float--fast">
                <HeroFlashcardCard />
              </div>

              <div className="sf-hero-panel sf-hero-panel--quiz sf-float sf-float--slow">
                <HeroQuizCard />
              </div>

              <div className="sf-hero-panel sf-hero-panel--progress sf-float">
                <HeroProgressCard />
              </div>

              <div className="sf-hero-panel sf-hero-panel--planner sf-float sf-float--slow">
                <HeroPlannerCard />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <a className="sf-hero__scroll" href="#product" aria-label="Skip to the product introduction">
        <span>Scroll</span>
        <span className="sf-hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
