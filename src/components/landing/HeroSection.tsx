import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { heroCtas, heroStages, type HeroCard, type HeroStage } from '../../data/landing'
import { cx, LandingLink } from './shared'
import { Aura } from './visuals'

const STAGE_COUNT = heroStages.length
const LAST_STAGE = STAGE_COUNT - 1
const TOP_EPSILON = 3
const WHEEL_THRESHOLD = 26
const WHEEL_GAP = 170
const FRESH_GAP = 140
const SWIPE_THRESHOLD = 44
const TRANSITION_FALLBACK = 1250

const cinematicEase = [0.16, 1, 0.3, 1] as const

type MotionCustom = {
  direction: number
  reduced: boolean
}

const headlineGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.09, delayChildren: 0.02 } },
  exit: { transition: { staggerChildren: 0.028 } },
}

const headlineLine: Variants = {
  enter: ({ direction, reduced }: MotionCustom) => ({
    opacity: 0,
    y: reduced ? '0%' : direction > 0 ? '38%' : '-38%',
    scale: reduced ? 1 : 0.985,
    rotateX: reduced ? 0 : direction > 0 ? 10 : -10,
    filter: reduced ? 'blur(0px)' : 'blur(12px)',
    letterSpacing: '0em',
    clipPath: reduced
      ? 'inset(0% 0% 0% 0%)'
      : direction > 0
        ? 'inset(0% 0% 100% 0%)'
        : 'inset(100% 0% 0% 0%)',
  }),
  center: ({ reduced }: MotionCustom) => ({
    opacity: 1,
    y: '0%',
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    letterSpacing: '0em',
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: reduced ? 0.01 : 0.64,
      ease: cinematicEase,
    },
  }),
  exit: ({ direction, reduced }: MotionCustom) => ({
    opacity: 0,
    y: reduced ? '0%' : direction > 0 ? '-18%' : '18%',
    scale: reduced ? 1 : 1.035,
    rotateX: reduced ? 0 : direction > 0 ? -8 : 8,
    filter: reduced ? 'blur(0px)' : 'blur(10px)',
    letterSpacing: reduced ? '0em' : '0.02em',
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: reduced ? 0.01 : 0.28,
      ease: cinematicEase,
    },
  }),
}

const cardsGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.075, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.03 } },
}

type CardCustom = MotionCustom & { index: number }

const cardMotion: Variants = {
  enter: ({ index, direction, reduced }: CardCustom) => ({
    opacity: 0,
    x: reduced ? 0 : (24 + index * 9) * direction,
    y: reduced ? 0 : [-12, 0, 14][index] * direction,
    scale: reduced ? 1 : 0.94,
    filter: reduced ? 'blur(0px)' : 'blur(10px)',
  }),
  center: ({ reduced }: CardCustom) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: reduced ? 0.01 : 0.62,
      ease: cinematicEase,
    },
  }),
  exit: ({ index, direction, reduced }: CardCustom) => ({
    opacity: 0,
    x: reduced ? 0 : (30 + index * 9) * direction,
    y: reduced ? 0 : [-14, 0, 16][index] * direction,
    scale: reduced ? 1 : 0.96,
    filter: reduced ? 'blur(0px)' : 'blur(8px)',
    transition: {
      duration: reduced ? 0.01 : 0.26,
      ease: cinematicEase,
    },
  }),
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

function HeroHeadline({
  stage,
  stageIndex,
  direction,
  reduced,
  onSettled,
}: {
  stage: HeroStage
  stageIndex: number
  direction: number
  reduced: boolean
  onSettled: (index: number) => void
}) {
  return (
    <h1
      className="sf-hero__title"
      id="hero-title"
      aria-label={stage.titleLines.join(' ')}
    >
      <AnimatePresence mode="wait">
        <motion.span
          className="sf-hero__headline"
          key={stage.id}
          variants={headlineGroup}
          initial="enter"
          animate="center"
          exit="exit"
          custom={{ direction, reduced }}
        >
          {stage.titleLines.map((line, index) => {
            const punctuated = line.endsWith('.')
            const text = punctuated ? line.slice(0, -1) : line
            const isLast = index === stage.titleLines.length - 1

            return (
              <motion.span
                className="sf-hero__line"
                key={`${stage.id}-${line}`}
                aria-hidden="true"
                variants={headlineLine}
                custom={{ direction, reduced }}
                onAnimationComplete={
                  isLast ? () => onSettled(stageIndex) : undefined
                }
              >
                {text}
                {punctuated && <span className="sf-hero__period">.</span>}
              </motion.span>
            )
          })}
        </motion.span>
      </AnimatePresence>
    </h1>
  )
}

function FloatingCards({
  stage,
  direction,
  reduced,
}: {
  stage: HeroStage
  direction: number
  reduced: boolean
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="sf-hero__cards"
        key={stage.id}
        variants={cardsGroup}
        initial="enter"
        animate="center"
        exit="exit"
        aria-hidden="true"
      >
        {stage.cards.map((card: HeroCard, index) => (
          <motion.div
            className={cx(
              'sf-hero__card',
              `sf-hero__card--${index}`,
              `is-${card.accent}`,
            )}
            key={`${stage.id}-${card.value}`}
            variants={cardMotion}
            custom={{ index, direction, reduced }}
          >
            <span className="sf-hero__card-line" />
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

function HeroProgress({
  stage,
  onSelect,
}: {
  stage: number
  onSelect: (index: number) => void
}) {
  return (
    <nav className="sf-hero__progress" aria-label="Hero story progress">
      <span className="sf-hero__progress-rail" aria-hidden="true" />
      {heroStages.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={cx(
            'sf-hero__dot',
            index === stage && 'is-active',
            index < stage && 'is-past',
          )}
          aria-label={`Show ${item.titleLines.join(' ').toLowerCase()}`}
          aria-current={index === stage ? 'step' : undefined}
          onClick={() => onSelect(index)}
        >
          <span aria-hidden="true" />
        </button>
      ))}
    </nav>
  )
}

function ScrollHint({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sf-hero__hint"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: reduced ? 0.01 : 0.7, delay: reduced ? 0 : 1.1 },
          }}
          exit={{
            opacity: 0,
            y: 6,
            transition: { duration: reduced ? 0.01 : 0.32, delay: 0 },
          }}
        >
          <span className="sf-hero__hint-text sf-hero__hint-text--desktop">
            Scroll to explore
          </span>
          <span className="sf-hero__hint-text sf-hero__hint-text--mobile">
            Swipe to explore
          </span>
          <motion.span
            className="sf-hero__hint-arrow"
            aria-hidden="true"
            animate={reduced ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="sf-hero__hint-arrow--desktop">↓</span>
            <span className="sf-hero__hint-arrow--mobile">↑</span>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Opening act and scroll-driven story.
 *
 * The hero owns vertical scrolling while the visitor is at the top and the
 * four-beat sequence is still open. One intentional wheel gesture or swipe
 * advances a single beat; a transition lock (released by the headline's final
 * animation, with a timeout as a safety net) absorbs momentum. The final beat
 * releases the page naturally into the next section.
 */
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() === true

  const [stage, setStage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)

  const stageRef = useRef(0)
  const lockRef = useRef(false)
  const lockTimer = useRef<number | null>(null)
  const gesture = useRef({
    acc: 0,
    last: 0,
    lastEvent: 0,
    direction: 0,
    consumed: false,
    fresh: false,
    suppressUntil: 0,
  })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const auraExitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90])
  const auraExitScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.94])
  const auraExitOpacity = useTransform(scrollYProgress, [0, 0.9], [1, reduced ? 1 : 0.12])
  const copyExitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -46])
  const copyExitOpacity = useTransform(scrollYProgress, [0, 0.78], [1, reduced ? 1 : 0])
  const cardsExitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -66])
  const cardsExitOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0])

  const releaseLock = useCallback(() => {
    lockRef.current = false
    if (lockTimer.current) {
      window.clearTimeout(lockTimer.current)
      lockTimer.current = null
    }
  }, [])

  const settleStage = useCallback(
    (index: number) => {
      if (index !== stageRef.current) return
      releaseLock()
    },
    [releaseLock],
  )

  const goToStage = useCallback(
    (next: number, nextDirection?: number) => {
      const target = Math.max(0, Math.min(LAST_STAGE, next))
      const current = stageRef.current
      if (lockRef.current || target === current) return false

      lockRef.current = true
      setDirection(nextDirection ?? (target > current ? 1 : -1))
      stageRef.current = target
      setStage(target)
      setHasInteracted(true)

      if (window.scrollY > TOP_EPSILON) {
        window.scrollTo({ top: 0, behavior: 'auto' })
      }

      if (lockTimer.current) window.clearTimeout(lockTimer.current)
      lockTimer.current = window.setTimeout(
        () => {
          lockRef.current = false
          lockTimer.current = null
        },
        reduced ? 260 : TRANSITION_FALLBACK,
      )

      return true
    },
    [reduced],
  )

  const selectStage = useCallback(
    (index: number) => {
      if (index === stageRef.current) {
        setHasInteracted(true)
        if (window.scrollY > TOP_EPSILON) {
          window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
        }
        return
      }
      /* An explicit choice from the progress dots should never feel dead,
         so it is allowed to interrupt an in-flight beat. */
      releaseLock()
      goToStage(index, index > stageRef.current ? 1 : -1)
    },
    [goToStage, reduced, releaseLock],
  )

  /* Wheel: one stage per intentional gesture, with momentum gating. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const state = gesture.current
    state.lastEvent = performance.now()

    const holdPage = (down: boolean) => {
      const current = stageRef.current
      return lockRef.current || (down ? current < LAST_STAGE : current > 0)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 0.4) return
      /* Dialogs lock the body; their scroll must never advance the story. */
      if (document.body.style.overflow === 'hidden') return

      const now = performance.now()
      const down = event.deltaY > 0

      if (window.scrollY > TOP_EPSILON) {
        state.lastEvent = now
        return
      }

      /* A page that has just arrived back at the top must settle before the
         hero re-arms, otherwise trackpad momentum reverses the whole story. */
      if (now < state.suppressUntil) {
        if (holdPage(down)) event.preventDefault()
        state.lastEvent = now
        return
      }

      if (state.fresh) {
        if (now - state.lastEvent < FRESH_GAP) {
          if (holdPage(down)) event.preventDefault()
          state.lastEvent = now
          return
        }
        state.fresh = false
      }

      /* While a beat is animating, absorb every gesture. */
      if (lockRef.current) {
        event.preventDefault()
        state.consumed = true
        state.acc = 0
        state.last = now
        state.lastEvent = now
        return
      }

      const current = stageRef.current
      const canStep = down ? current < LAST_STAGE : current > 0

      /* At the end of the story a downward gesture releases the page. */
      if (!canStep) {
        state.lastEvent = now
        if (down) state.consumed = true
        return
      }

      event.preventDefault()

      const sign = down ? 1 : -1
      if (state.direction !== sign || now - state.last > WHEEL_GAP) {
        state.acc = 0
        state.consumed = false
      }

      state.direction = sign
      state.last = now
      state.lastEvent = now

      if (state.consumed) return

      state.acc += event.deltaY
      if (Math.abs(state.acc) < WHEEL_THRESHOLD) return

      state.consumed = true
      state.acc = 0
      goToStage(current + sign, sign)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [goToStage])

  /* Re-arm the hero only once upward momentum has actually finished. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const state = gesture.current
    let wasAtTop = window.scrollY <= TOP_EPSILON

    const onScroll = () => {
      const atTop = window.scrollY <= TOP_EPSILON
      if (!atTop) {
        wasAtTop = false
        return
      }
      if (wasAtTop) return
      wasAtTop = true
      state.fresh = true
      state.suppressUntil = performance.now() + 100
      state.lastEvent = performance.now()
      state.acc = 0
      state.consumed = false
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Touch: one intentional swipe per beat, reverse supported. */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const touch = { active: false, x: 0, y: 0, time: 0 }

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || window.scrollY > TOP_EPSILON) {
        touch.active = false
        return
      }
      const point = event.touches[0]
      touch.active = true
      touch.x = point.clientX
      touch.y = point.clientY
      touch.time = performance.now()
    }

    const onMove = (event: TouchEvent) => {
      if (!touch.active || event.touches.length !== 1) return
      const point = event.touches[0]
      const deltaY = touch.y - point.clientY
      const deltaX = Math.abs(point.clientX - touch.x)
      if (Math.abs(deltaY) < 8 || Math.abs(deltaY) < deltaX * 1.15) return

      const forward = deltaY > 0
      const current = stageRef.current
      const canStep = forward ? current < LAST_STAGE : current > 0
      if (lockRef.current || canStep) event.preventDefault()
    }

    const finish = (event: TouchEvent) => {
      if (!touch.active) return
      touch.active = false
      if (window.scrollY > TOP_EPSILON || lockRef.current) return

      const point = event.changedTouches[0]
      if (!point) return
      const deltaY = touch.y - point.clientY
      const deltaX = Math.abs(point.clientX - touch.x)
      const elapsed = performance.now() - touch.time

      if (Math.abs(deltaY) < SWIPE_THRESHOLD) return
      if (Math.abs(deltaY) < deltaX * 1.15 || elapsed > 900) return

      if (deltaY > 0) {
        goToStage(stageRef.current + 1, 1)
      } else {
        goToStage(stageRef.current - 1, -1)
      }
    }

    const cancel = () => {
      touch.active = false
    }

    hero.addEventListener('touchstart', onStart, { passive: true })
    hero.addEventListener('touchmove', onMove, { passive: false })
    hero.addEventListener('touchend', finish, { passive: true })
    hero.addEventListener('touchcancel', cancel, { passive: true })

    return () => {
      hero.removeEventListener('touchstart', onStart)
      hero.removeEventListener('touchmove', onMove)
      hero.removeEventListener('touchend', finish)
      hero.removeEventListener('touchcancel', cancel)
    }
  }, [goToStage])

  /* Pointer tilt, only on fine pointers and only when motion is welcome. */
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

  useEffect(() => {
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current)
    }
  }, [])

  const currentStage = heroStages[stage]
  const auraOffsets = [0, -7, -13, -5]
  const auraScales = [1, 1.035, 1.06, 1.09]

  return (
    <section
      ref={heroRef}
      className="sf-hero"
      id="top"
      aria-labelledby="hero-title"
      data-stage={stage}
    >
      <div className="sf-hero__atmosphere" aria-hidden="true">
        <span className="sf-hero__grid" />
        <span className="sf-hero__glow sf-hero__glow--blue" />
        <span className="sf-hero__glow sf-hero__glow--violet" />
        <span className="sf-hero__orbit sf-hero__orbit--a" />
        <span className="sf-hero__orbit sf-hero__orbit--b" />
        <span className="sf-hero__orbit sf-hero__orbit--c" />
        <span className="sf-hero__particles">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>

      <motion.div
        className="sf-hero__aura"
        style={{
          y: auraExitY,
          scale: auraExitScale,
          opacity: auraExitOpacity,
          rotateX,
          rotateY,
        }}
      >
        <motion.div
          className="sf-hero__aura-shift"
          animate={{
            y: auraOffsets[stage],
            scale: auraScales[stage],
            opacity: [0.92, 0.95, 0.97, 1][stage],
          }}
          transition={{ duration: reduced ? 0.01 : 1.1, ease: cinematicEase }}
        >
          <Aura variant="hero" stage={stage} />
        </motion.div>
      </motion.div>

      <motion.div
        className="sf-hero__cards-layer"
        style={{ y: cardsExitY, opacity: cardsExitOpacity }}
      >
        <FloatingCards stage={currentStage} direction={direction} reduced={reduced} />
      </motion.div>

      <div className="sf-container sf-hero__inner">
        <motion.div
          className="sf-hero__copy"
          style={{ y: copyExitY, opacity: copyExitOpacity }}
        >
          <HeroHeadline
            stage={currentStage}
            stageIndex={stage}
            direction={direction}
            reduced={reduced}
            onSettled={settleStage}
          />

          <div className="sf-hero__lower">
            <AnimatePresence mode="wait">
              <motion.p
                className="sf-hero__description"
                key={currentStage.id}
                initial={
                  reduced ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: reduced ? 0.01 : 0.62,
                    delay: reduced ? 0 : 0.18,
                    ease: cinematicEase,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  filter: 'blur(4px)',
                  transition: { duration: reduced ? 0.01 : 0.22, ease: 'easeOut' },
                }}
              >
                {currentStage.description}
              </motion.p>
            </AnimatePresence>

            <div className="sf-hero__actions">
              <LandingLink href="/home" variant="primary" size="lg" showArrow>
                {heroCtas.primary}
              </LandingLink>
              <LandingLink href="#how-it-works" variant="secondary" size="lg">
                {heroCtas.secondary}
              </LandingLink>
            </div>
          </div>

          <p className="sf-visually-hidden" aria-live="polite">
            {currentStage.titleLines.join(' ')}. {currentStage.description}
          </p>
        </motion.div>
      </div>

      <HeroProgress stage={stage} onSelect={selectStage} />
      <ScrollHint visible={!hasInteracted} reduced={reduced} />
    </section>
  )
}
