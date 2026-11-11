import React, { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cx } from './shared'

/**
 * Site-wide atmosphere: a cursor-following spotlight on fine-pointer devices
 * plus a static technical grid. The spotlight is a single fixed element driven
 * by one animation frame per pointer movement, so it cannot cause layout work.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight * 0.32

    const paint = () => {
      frame = 0
      element.style.setProperty('--sf-cursor-x', `${x}px`)
      element.style.setProperty('--sf-cursor-y', `${y}px`)
    }

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="sf-atmosphere" aria-hidden="true">
      <div className="sf-atmosphere__grid" />
      <div ref={ref} className="sf-atmosphere__spotlight" />
      <div className="sf-atmosphere__vignette" />
    </div>
  )
}

/**
 * The recurring organic intelligence form. Built from layered radial
 * gradients and slow morphing border radii rather than WebGL, so it stays
 * smooth on integrated graphics and phones.
 */
export function Aura({
  variant = 'hero',
  className,
}: {
  variant?: 'hero' | 'privacy' | 'final'
  className?: string
}) {
  const reduced = useReducedMotion() === true

  return (
    <div
      className={cx('sf-aura', `sf-aura--${variant}`, reduced && 'sf-aura--still', className)}
      aria-hidden="true"
    >
      <span className="sf-aura__halo" />
      <span className="sf-aura__ring sf-aura__ring--one" />
      <span className="sf-aura__ring sf-aura__ring--two" />
      <span className="sf-aura__core">
        <span className="sf-aura__blob sf-aura__blob--blue" />
        <span className="sf-aura__blob sf-aura__blob--violet" />
        <span className="sf-aura__blob sf-aura__blob--orange" />
        <span className="sf-aura__blob sf-aura__blob--red" />
        <span className="sf-aura__blob sf-aura__blob--white" />
        <span className="sf-aura__vein sf-aura__vein--a" />
        <span className="sf-aura__vein sf-aura__vein--b" />
        <span className="sf-aura__sheen" />
      </span>
      <span className="sf-aura__spark sf-aura__spark--a" />
      <span className="sf-aura__spark sf-aura__spark--b" />
      <span className="sf-aura__spark sf-aura__spark--c" />
      <span className="sf-aura__coordinates">SF / NEURAL FIELD</span>
    </div>
  )
}

/** Faint information stream. Purely decorative and extremely low contrast. */
export function DataRain({ className }: { className?: string }) {
  const columns = [
    '01001110 01001111 01000100 01000101',
    'LEARN · RECALL · CONNECT · REPEAT',
    '10110101 11001010 00101101 10110010',
    'UNDERSTAND · PRACTISE · REMEMBER',
    '01101100 01100101 01100001 01110010',
    'SYNAPSE 001 110 010 101 000',
  ]

  return (
    <div className={cx('sf-datarain', className)} aria-hidden="true">
      {columns.map((column, index) => (
        <span key={column} style={{ animationDelay: `${index * -4.4}s` }}>
          {column}
        </span>
      ))}
    </div>
  )
}

const neuralNodes = [
  { x: 50, y: 46, r: 13, accent: 'blue' },
  { x: 24, y: 28, r: 7, accent: 'violet' },
  { x: 76, y: 25, r: 6, accent: 'orange' },
  { x: 82, y: 62, r: 8, accent: 'red' },
  { x: 20, y: 68, r: 6, accent: 'white' },
  { x: 50, y: 82, r: 5, accent: 'blue' },
  { x: 37, y: 52, r: 4, accent: 'white' },
  { x: 66, y: 48, r: 4, accent: 'violet' },
]

const neuralLinks = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 6],
  [6, 0],
  [2, 7],
  [7, 0],
  [3, 7],
  [4, 6],
  [5, 7],
]

/** Scroll-linked neural field. Paths draw in as the section enters view. */
export function NeuralField() {
  const reduced = useReducedMotion() === true
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="sf-neural" ref={ref} aria-hidden="true">
      <div className="sf-neural__grid" />
      <svg viewBox="0 0 100 100" className="sf-neural__svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="neural-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(79,140,255,0.9)" />
            <stop offset="55%" stopColor="rgba(191,195,200,0.45)" />
            <stop offset="100%" stopColor="rgba(255,122,69,0.8)" />
          </linearGradient>
          <radialGradient id="neural-core">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="45%" stopColor="rgba(79,140,255,0.55)" />
            <stop offset="100%" stopColor="rgba(79,140,255,0)" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="46" r="26" fill="url(#neural-core)" opacity="0.22" />

        {neuralLinks.map(([from, to], index) => {
          const a = neuralNodes[from]
          const b = neuralNodes[to]
          return (
            <motion.path
              key={`${from}-${to}`}
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
              stroke="url(#neural-line)"
              strokeWidth={index % 3 === 0 ? 0.32 : 0.18}
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduced ? undefined : { pathLength: 1, opacity: 0.78 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 1.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
          )
        })}

        {neuralNodes.map((node, index) => (
          <g key={`${node.x}-${node.y}`} className={cx('sf-neural__node', `is-${node.accent}`)}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r + 2.6}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={0.16}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={reduced ? false : { scale: 0.6, opacity: 0 }}
              whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.08 }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="currentColor"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={reduced ? false : { scale: 0.4, opacity: 0 }}
              whileInView={reduced ? undefined : { scale: 1, opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 + index * 0.08 }}
            />
          </g>
        ))}
      </svg>
      <span className="sf-neural__label sf-neural__label--a">MEMORY PATH / 01</span>
      <span className="sf-neural__label sf-neural__label--b">CONNECTION STRENGTH</span>
      <span className="sf-neural__label sf-neural__label--c">RECALL LOOP</span>
    </div>
  )
}
