import React, { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { heroCopy } from '../../data/landing'
import { LandingLink } from './shared'
import {
  HeroFlashcardCard,
  HeroLessonCard,
  HeroProgressCard,
  HeroQuizCard,
} from './ProductPreviews'

const lineContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.022,
      delayChildren: 0.18,
    },
  },
}

const letter = {
  hidden: { y: '108%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const specs = heroCopy.trust.split(' · ')

/**
 * Cinematic opening act.
 *
 * The copy and console share one scroll timeline: the words leave first, the
 * product console moves forward, and the whole composition dissolves into the
 * showcase. Pointer tilt is desktop-only and is written to motion values so it
 * never causes a React render.
 */
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() === true

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.78], [1, reduced ? 1 : 0.15])
  const stageY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -44])
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.06])
  const stageOpacity = useTransform(scrollYProgress, [0, 0.9], [1, reduced ? 1 : 0.35])

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 85, damping: 22, mass: 0.5 })
  const smoothY = useSpring(pointerY, { stiffness: 85, damping: 22, mass: 0.5 })
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5])
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4])

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const element = heroRef.current
    if (!element) return

    let frame = 0
    let nextX = 0
    let nextY = 0

    const paint = () => {
      frame = 0
      pointerX.set(nextX)
      pointerY.set(nextY)
    }

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      nextX = (event.clientX - rect.left) / rect.width - 0.5
      nextY = (event.clientY - rect.top) / rect.height - 0.5
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const onLeave = () => {
      nextX = 0
      nextY = 0
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pointerX, pointerY, reduced])

  return (
    <motion.section
      ref={heroRef}
      className="sf-hero"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="sf-hero__ambient" aria-hidden="true">
        <div className="sf-hero__technical-grid" />
        <div className="sf-hero__scanline" />
        <div className="sf-hero__orbit sf-hero__orbit--a" />
        <div className="sf-hero__orbit sf-hero__orbit--b" />
        <div className="sf-hero__glow" />
      </div>

      <div className="sf-container sf-hero__container">
        <div className="sf-hero__layout">
          <motion.div className="sf-hero__copy" style={{ y: copyY, opacity: copyOpacity }}>
            <div className="sf-hero__topline">
              <span className="sf-status">
                <span className="sf-status__dot" aria-hidden="true" />
                {heroCopy.status}
              </span>
              <span className="sf-coordinate">{heroCopy.coordinates}</span>
            </div>

            <p className="sf-eyebrow sf-hero__eyebrow">{heroCopy.eyebrow}</p>

            <motion.h1
              className="sf-display sf-hero__title"
              id="hero-title"
              aria-label={heroCopy.titleLines.join(' ')}
              variants={lineContainer}
              initial={reduced ? false : 'hidden'}
              animate="visible"
            >
              {heroCopy.titleLines.map((line, lineIndex) => (
                <span className="sf-hero__line" aria-hidden="true" key={line}>
                  {line.split(' ').map((word, wordIndex) => (
                    <span className="sf-hero__word" key={`${word}-${wordIndex}`}>
                      {word.split('').map((character, characterIndex) => (
                        <span className="sf-hero__letter-mask" key={`${character}-${characterIndex}`}>
                          <motion.span
                            className="sf-hero__letter"
                            variants={reduced ? undefined : letter}
                          >
                            {character}
                          </motion.span>
                        </span>
                      ))}
                      {lineIndex === 0 && wordIndex === 0 ? (
                        <span className="sf-hero__signal" aria-hidden="true" />
                      ) : null}
                    </span>
                  ))}
                </span>
              ))}
            </motion.h1>

            <p className="sf-lead sf-hero__description">{heroCopy.description}</p>

            <div className="sf-actions sf-hero__actions">
              <LandingLink href="/home" variant="primary" size="lg" showArrow>
                {heroCopy.primaryCta}
              </LandingLink>
              <LandingLink href="#showcase" variant="secondary" size="lg">
                {heroCopy.secondaryCta}
              </LandingLink>
            </div>

            <ul className="sf-hero__specs" aria-label="Studifree at a glance">
              {specs.map((spec, index) => (
                <li key={spec}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  {spec}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="sf-hero__visual"
            style={{ y: stageY, scale: stageScale, opacity: stageOpacity }}
          >
            <div className="sf-hero__axis sf-hero__axis--top" aria-hidden="true">
              <span>SF—01</span>
              <span>LEARNING INTELLIGENCE</span>
              <span>2026</span>
            </div>

            <div className="sf-hero__axis sf-hero__axis--side" aria-hidden="true">
              <span>LAT 00.00</span>
              <span>LON 00.00</span>
            </div>

            <motion.div
              className="sf-hero__stage"
              style={{ rotateX, rotateY }}
              aria-hidden="true"
            >
              <div className="sf-hero__ring sf-hero__ring--one" />
              <div className="sf-hero__ring sf-hero__ring--two" />

              <div className="sf-console">
                <div className="sf-console__bar">
                  <span className="sf-console__status">
                    <span /> LIVE SESSION
                  </span>
                  <span className="sf-console__title">SF / LEARNING CONSOLE</span>
                  <span className="sf-console__code">V.01</span>
                </div>
                <div className="sf-console__screen">
                  <HeroLessonCard />
                </div>
                <div className="sf-console__footer">
                  <span>AI PERSONAL TEACHER</span>
                  <span className="sf-console__meter">
                    <span />
                  </span>
                  <span>READY</span>
                </div>
              </div>

              <div className="sf-hero-panel sf-hero-panel--flashcard">
                <div className="sf-hero-panel__float sf-hero-panel__float--fast">
                  <HeroFlashcardCard />
                </div>
              </div>

              <div className="sf-hero-panel sf-hero-panel--quiz">
                <div className="sf-hero-panel__float sf-hero-panel__float--slow">
                  <HeroQuizCard />
                </div>
              </div>

              <div className="sf-hero-panel sf-hero-panel--progress">
                <div className="sf-hero-panel__float">
                  <HeroProgressCard />
                </div>
              </div>

              <span className="sf-hero__hud sf-hero__hud--a">01 / UNDERSTAND</span>
              <span className="sf-hero__hud sf-hero__hud--b">SYNCED / LOCAL</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <a className="sf-hero__scroll" href="#showcase" aria-label="Continue to the product system">
        <span>Enter the system</span>
        <span className="sf-hero__scroll-line" aria-hidden="true" />
      </a>
    </motion.section>
  )
}
