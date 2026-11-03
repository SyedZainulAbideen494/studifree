import React, { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ChartNoAxesColumn,
  ClipboardCheck,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react'
import { featureStories } from '../../data/landing'
import { LandingLink, Reveal, SectionHead, cx } from './shared'
import {
  FlashcardPreview,
  LessonPreview,
  NotesPreview,
  ProgressPreview,
  QuizPreview,
  WindowChrome,
} from './ProductPreviews'

const stageIds = [
  'feature-ai-teacher',
  'feature-flashcards',
  'feature-quiz',
  'feature-notes',
  'feature-progress',
] as const

type StageId = (typeof stageIds)[number]

interface Stage {
  id: StageId
  index: string
  label: string
  title: string
  body: string
  to: string
  cta: string
  icon: typeof Sparkles
}

const stageCopy: Record<StageId, { index: string; title: string; body: string }> = {
  'feature-ai-teacher': {
    index: '01',
    title: 'Ask. Understand. Ask again.',
    body: 'A patient, step-by-step explanation built around your level, with follow-up questions when something still feels unclear.',
  },
  'feature-flashcards': {
    index: '02',
    title: 'Turn understanding into recall.',
    body: 'Build a deck from a topic or write your own cards. Review with active recall and spacing guided by your confidence.',
  },
  'feature-quiz': {
    index: '03',
    title: 'Test what you actually know.',
    body: 'Generate a quiz from a topic or your own material, then read the explanation behind every answer.',
  },
  'feature-notes': {
    index: '04',
    title: 'Shape the lesson into notes.',
    body: 'Definitions, key points, common misconceptions and a memory trick, arranged into structured study material.',
  },
  'feature-progress': {
    index: '05',
    title: 'See where the next session should go.',
    body: 'Activity, quiz results, due reviews and concept mastery, built from the study data already on your device.',
  },
}

const stageIcons: Record<StageId, typeof Sparkles> = {
  'feature-ai-teacher': Sparkles,
  'feature-flashcards': Layers,
  'feature-quiz': ClipboardCheck,
  'feature-notes': FileText,
  'feature-progress': ChartNoAxesColumn,
}

const stages: Stage[] = stageIds.map((id) => {
  const story = featureStories.find((item) => item.id === id) ?? featureStories[0]
  return {
    id,
    index: stageCopy[id].index,
    label: story.label,
    title: stageCopy[id].title,
    body: stageCopy[id].body,
    to: story.to,
    cta: story.cta,
    icon: stageIcons[id],
  }
})

function StagePreview({ id }: { id: StageId }) {
  switch (id) {
    case 'feature-ai-teacher':
      return (
        <WindowChrome title="Learn · AI teacher" roomy>
          <LessonPreview />
        </WindowChrome>
      )
    case 'feature-flashcards':
      return (
        <WindowChrome title="Flashcards · Review" roomy>
          <FlashcardPreview />
        </WindowChrome>
      )
    case 'feature-quiz':
      return (
        <WindowChrome title="Quiz Studio · Practice" roomy>
          <QuizPreview />
        </WindowChrome>
      )
    case 'feature-notes':
      return (
        <WindowChrome title="Notes · Structured lesson" roomy>
          <NotesPreview />
        </WindowChrome>
      )
    case 'feature-progress':
      return (
        <WindowChrome title="Progress · This week" roomy>
          <ProgressPreview />
        </WindowChrome>
      )
    default:
      return null
  }
}

function StageCard({ stage }: { stage: Stage }) {
  const Icon = stage.icon

  return (
    <article className="sf-showcase-card">
      <div className="sf-showcase-card__meta">
        <span className="sf-showcase-card__index">{stage.index}</span>
        <span className="sf-showcase-card__label">
          <Icon width={13} height={13} aria-hidden="true" />
          {stage.label}
        </span>
      </div>
      <div className="sf-showcase-card__preview">
        <StagePreview id={stage.id} />
      </div>
      <div className="sf-showcase-card__copy">
        <h3>{stage.title}</h3>
        <p>{stage.body}</p>
        <LandingLink href={stage.to} variant="secondary" size="sm" showArrow>
          {stage.cta}
        </LandingLink>
      </div>
    </article>
  )
}

/**
 * Pinned product sequence.
 *
 * Desktop keeps one console pinned while natural page scrolling advances the
 * five modes. There is no wheel interception and no custom scroll container.
 * Mobile gets a swipeable, scroll-snapped track; reduced-motion visitors get a
 * static grid with every mode visible at once.
 */
export function ProductShowcase() {
  const reduced = useReducedMotion() === true
  const desktopRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ['start start', 'end end'],
  })

  const railProgress = useTransform(scrollYProgress, [0, 1], [0.04, 1])

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(stages.length - 1, Math.max(0, Math.floor(value * stages.length)))
    setActive((current) => (current === next ? current : next))
  })

  const stage = stages[active]

  const goTo = (index: number) => {
    const element = desktopRef.current
    if (!element || typeof window === 'undefined') return
    const rect = element.getBoundingClientRect()
    const sectionTop = window.scrollY + rect.top
    const distance = element.offsetHeight - window.innerHeight
    const ratio = (index + 0.5) / stages.length
    window.scrollTo({
      top: sectionTop + distance * ratio,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  if (reduced) {
    return (
      <section className="sf-showcase" id="showcase" aria-labelledby="showcase-title">
        <div className="sf-container">
          <SectionHead
            eyebrow="The product system"
            meta="02 / SHOWCASE"
            title={<span id="showcase-title">One space. Five ways to move forward.</span>}
            description="Understand, recall, apply, organise and review. Every mode is part of the same learning loop, and the interface changes only when the work changes."
          />
          <div className="sf-showcase__static">
            {stages.map((item, index) => (
              <Reveal key={item.id} delay={0.04 * index} y={18}>
                <StageCard stage={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="sf-showcase" id="showcase" aria-labelledby="showcase-title">
      <div className="sf-showcase__desktop" ref={desktopRef}>
        <div className="sf-showcase__sticky">
          <div className="sf-container sf-showcase__frame">
            <div className="sf-showcase__rail">
              <p className="sf-eyebrow">The product system</p>
              <h2 className="sf-showcase__title" id="showcase-title">
                One space.
                <br />
                Five ways forward.
              </h2>
              <p className="sf-showcase__intro">
                Understand, recall, apply, organise and review. Every mode is part of the same
                learning loop.
              </p>

              <ol className="sf-showcase__list" aria-label="Product modes">
                {stages.map((item, index) => {
                  const Icon = item.icon
                  const current = index === active
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={cx('sf-showcase__item', current && 'is-current')}
                        aria-current={current ? 'step' : undefined}
                        onClick={() => goTo(index)}
                      >
                        <span className="sf-showcase__item-index">{item.index}</span>
                        <span className="sf-showcase__item-icon" aria-hidden="true">
                          <Icon width={15} height={15} />
                        </span>
                        <span className="sf-showcase__item-label">{item.label}</span>
                        <span className="sf-showcase__item-mark" aria-hidden="true" />
                      </button>
                    </li>
                  )
                })}
              </ol>

              <div className="sf-showcase__progress" aria-hidden="true">
                <span className="sf-showcase__progress-track">
                  <motion.span className="sf-showcase__progress-fill" style={{ scaleY: railProgress }} />
                </span>
                <span className="sf-showcase__progress-value">
                  {String(active + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="sf-showcase__visual">
              <div className="sf-showcase__visual-top">
                <span>SEQUENCE / {String(active + 1).padStart(2, '0')}</span>
                <span className="sf-showcase__visual-label">{stage.label}</span>
              </div>

              <div className="sf-showcase__stage">
                <div className="sf-showcase__stage-grid" aria-hidden="true" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={stage.id}
                    className="sf-showcase__pane"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <StagePreview id={stage.id} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="sf-showcase__visual-copy">
                <div>
                  <span className="sf-showcase__visual-index">{stage.index}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                </div>
                <LandingLink href={stage.to} variant="secondary" size="sm" showArrow>
                  {stage.cta}
                </LandingLink>
              </div>

              <div className="sf-showcase__visual-foot">
                <span>Illustrative interface preview</span>
                <span>No account required for supported local tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-showcase__mobile">
        <div className="sf-container">
          <SectionHead
            eyebrow="The product system"
            meta="02 / SHOWCASE"
            title={<span id="showcase-mobile-title">One space. Five ways forward.</span>}
            description="Understand, recall, apply, organise and review. Swipe through the learning loop, or open any tool directly."
          />
          <div className="sf-showcase__swipe">
            <span>Swipe to explore</span>
            <span aria-hidden="true">01 — 05</span>
          </div>
          <div className="sf-showcase__track">
            {stages.map((item) => (
              <StageCard key={item.id} stage={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
