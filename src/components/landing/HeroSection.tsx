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
import { Aura } from './visuals'

const lineGroup = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.028, delayChildren: 0.45 },
  },
}

const letter = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] as const },
  },
}

/**
 * Opening act: oversized type, a slowly morphing intelligence form and
 * instrument-like floating readouts. The whole composition is scroll-linked
 * and pointer-reactive only on fine-pointer devices.
 */
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() === true

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -110])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.72], [1, reduced ? 1 : 0.12])
  const auraY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 150])
  const auraScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.14])
  const statsY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60])
  const lowerOpacity = useTransform(scrollYProgress, [0, 0.58], [1, reduced ? 1 : 0])

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 22, mass: 0.6 })
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 22, mass: 0.6 })
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4])
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3, -3])

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
    <section ref={heroRef} className="sf-hero" id="top" aria-labelledby="hero-title">
      <motion.div
        className="sf-hero__aura"
        style={{ y: auraY, scale: auraScale, rotateX, rotateY }}
      >
        <Aura variant="hero" />
      </motion.div>

      <div className="sf-container sf-hero__inner">
        <motion.div className="sf-hero__copy" style={{ y: titleY, opacity: titleOpacity }}>
          <p className="sf-label sf-hero__eyebrow">{heroCopy.eyebrow}</p>

          <motion.h1
            className="sf-hero__title"
            id="hero-title"
            aria-label={heroCopy.titleLines.join(' ')}
            variants={lineGroup}
            initial={reduced ? false : 'hidden'}
            animate="visible"
          >
            {heroCopy.titleLines.map((line, lineIndex) => (
              <span className="sf-hero__line" aria-hidden="true" key={line}>
                {line.split('').map((character, characterIndex) => (
                  <span className="sf-hero__letter-mask" key={`${character}-${characterIndex}`}>
                    <motion.span
                      className={
                        character === '.'
                          ? 'sf-hero__letter sf-hero__letter--accent'
                          : 'sf-hero__letter'
                      }
                      variants={reduced ? undefined : letter}
                    >
                      {character}
                    </motion.span>
                  </span>
                ))}
                {lineIndex === 0 && <span className="sf-hero__signal" aria-hidden="true" />}
              </span>
            ))}
          </motion.h1>
        </motion.div>

        <motion.div className="sf-hero__lower" style={{ opacity: lowerOpacity }}>
          <motion.p
            className="sf-hero__description"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {heroCopy.description}
          </motion.p>

          <motion.div
            className="sf-hero__actions"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingLink href="/home" variant="primary" size="lg" showArrow>
              {heroCopy.primaryCta}
            </LandingLink>
            <LandingLink href="#how-it-works" variant="secondary" size="lg">
              {heroCopy.secondaryCta}
            </LandingLink>
          </motion.div>

          <motion.p
            className="sf-hero__note"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.5 }}
          >
            {heroCopy.note}
          </motion.p>
        </motion.div>
      </div>

      <motion.div className="sf-hero__stats" style={{ y: statsY }} aria-label="Studifree at a glance">
        {heroCopy.stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`sf-hero__stat ${stat.className}`}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.6 + index * 0.1 }}
          >
            <span className="sf-hero__stat-line" aria-hidden="true" />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <a className="sf-hero__scroll" href="#what" aria-label="Continue to the introduction">
        <span className="sf-hero__scroll-track" aria-hidden="true">
          <span />
        </span>
      </a>
    </section>
  )
}
