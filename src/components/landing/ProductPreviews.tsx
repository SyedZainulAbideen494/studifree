import React, { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Layers,
  Send,
  Sparkles,
} from 'lucide-react'
import { cx } from './shared'

/* -------------------------------------------------------------------------- */
/* Shared window chrome                                                       */
/* -------------------------------------------------------------------------- */

interface WindowChromeProps {
  title: string
  children: React.ReactNode
  roomy?: boolean
  className?: string
}

export function WindowChrome({ title, children, roomy = false, className }: WindowChromeProps) {
  return (
    <div className={cx('sf-window', className)}>
      <div className="sf-window__bar">
        <span className="sf-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-window__title">{title}</span>
      </div>
      <div className={cx('sf-window__body', roomy && 'sf-window__body--roomy')}>{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Learn                                                                      */
/* -------------------------------------------------------------------------- */

export function LessonPreview() {
  return (
    <div className="sf-lesson-preview">
      <p className="sf-lesson-preview__question">Can you explain photosynthesis simply?</p>

      <div className="sf-lesson-preview__answer">
        <h4>Photosynthesis, in plain words</h4>
        <p>
          A plant uses <span className="sf-highlight">sunlight</span> to turn carbon dioxide and water
          into glucose. Oxygen is released along the way.
        </p>
        <p>
          Think of a leaf as a tiny kitchen: light is the stove, water and air are the ingredients,
          and glucose is the meal the plant keeps for energy.
        </p>
        <div className="sf-concepts" aria-label="Related concepts">
          <span className="sf-concept">Chlorophyll</span>
          <span className="sf-concept">Light reactions</span>
          <span className="sf-concept">Glucose</span>
        </div>
      </div>

      <div className="sf-lesson-preview__followup">
        <Sparkles width={13} height={13} aria-hidden="true" />
        Ask a follow-up · Make it simpler · Give an example
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Flashcards                                                                 */
/* -------------------------------------------------------------------------- */

const confidenceRatings = ['Again', 'Hard', 'Good', 'Easy'] as const

export function FlashcardPreview() {
  const [flipped, setFlipped] = useState(false)
  const [rating, setRating] = useState<(typeof confidenceRatings)[number] | null>(null)

  return (
    <div>
      <button
        type="button"
        className="sf-flip"
        aria-pressed={flipped}
        aria-label={flipped ? 'Show the question' : 'Reveal the answer'}
        onClick={() => setFlipped((value) => !value)}
      >
        <span className="sf-flip__inner">
          <span className="sf-flip__face">
            <span className="sf-flip__meta">
              <span>Biology · Cell division</span>
              <span>Card 7 of 24</span>
            </span>
            <span className="sf-flip__text">What is the difference between mitosis and meiosis?</span>
            <span className="sf-flip__hint">
              <Sparkles width={13} height={13} aria-hidden="true" />
              Tap to reveal the answer
            </span>
          </span>
          <span className="sf-flip__face sf-flip__face--back">
            <span className="sf-flip__meta">
              <span>Answer</span>
              <span>Active recall</span>
            </span>
            <span className="sf-flip__text sf-flip__text--answer">
              Mitosis produces two identical body cells for growth and repair. Meiosis produces four
              genetically different gametes for reproduction.
            </span>
            <span className="sf-flip__hint">Tap again to go back</span>
          </span>
        </span>
      </button>

      <div className="sf-confidence" role="group" aria-label="How well did you know this?">
        {confidenceRatings.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <p className="sf-small" aria-live="polite" style={{ marginTop: 10 }}>
        {rating
          ? `Rated “${rating}”. Confidence ratings guide when a card appears again.`
          : 'Rate each card to guide spaced-repetition reviews.'}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Quiz                                                                       */
/* -------------------------------------------------------------------------- */

const quizOptions = [
  'It increases without limit',
  'It stays exactly constant',
  'It slows and levels off near the carrying capacity',
  'It drops to zero immediately',
]

export function QuizPreview() {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const correct = 2
  const isCorrect = selected === correct

  const reset = () => {
    setSelected(null)
    setSubmitted(false)
  }

  return (
    <div>
      <div className="sf-mini-heading">
        <strong>Question 4 of 10</strong>
        <span>Practice mode</span>
      </div>
      <p className="sf-quiz__question">
        A population grows in an environment with limited resources. What usually happens to its growth
        rate over time?
      </p>

      <div className="sf-quiz__options" role="group" aria-label="Answer choices">
        {quizOptions.map((option, index) => {
          const stateClass =
            submitted && index === correct
              ? 'sf-quiz__option--correct'
              : submitted && index === selected
                ? 'sf-quiz__option--wrong'
                : undefined
          return (
            <button
              key={option}
              type="button"
              className={cx('sf-quiz__option', stateClass)}
              aria-pressed={selected === index}
              onClick={() => {
                if (submitted) return
                setSelected(index)
              }}
            >
              {option}
            </button>
          )
        })}
      </div>

      <div className="sf-quiz__footer">
        <span>{submitted ? 'Explanation shown' : 'Choose one answer'}</span>
        {submitted ? (
          <button type="button" className="sf-quiz__submit" onClick={reset}>
            Try again
          </button>
        ) : (
          <button
            type="button"
            className="sf-quiz__submit"
            disabled={selected === null}
            onClick={() => setSubmitted(true)}
          >
            Submit answer
          </button>
        )}
      </div>

      {submitted && (
        <p className="sf-quiz__result" aria-live="polite">
          <strong style={{ color: '#fff' }}>{isCorrect ? 'Correct. ' : 'Not quite. '}</strong>
          Limited resources slow growth, so the population tends to level off near the environment’s
          carrying capacity.
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* AI notes                                                                   */
/* -------------------------------------------------------------------------- */

export function NotesPreview() {
  return (
    <div className="sf-notes">
      <aside className="sf-notes__side" aria-label="Lesson sections">
        <p>This lesson</p>
        <ul>
          <li>Water cycle</li>
          <li>Key stages</li>
          <li>Misconceptions</li>
          <li>Memory trick</li>
        </ul>
      </aside>
      <div className="sf-notes__doc">
        <h4>The water cycle</h4>
        <p className="sf-notes__definition">
          The continuous movement of water between the ocean, atmosphere and land through evaporation,
          condensation and precipitation.
        </p>
        <h5>Key stages</h5>
        <ul>
          <li>Evaporation moves water vapour into the air.</li>
          <li>Condensation forms clouds as vapour cools.</li>
          <li>Precipitation returns water to the surface.</li>
          <li>Collection gathers water in rivers, lakes and soil.</li>
        </ul>
        <h5>Common misconception</h5>
        <p>Water is not “used up” by the cycle. It changes location and state.</p>
        <div className="sf-notes__callout">Memory trick: evaporate, condense, precipitate, collect — ECPC.</div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Planner                                                                    */
/* -------------------------------------------------------------------------- */

const initialTasks = [
  { id: 'one', label: 'Review biology deck', done: true },
  { id: 'two', label: 'Finish algebra quiz', done: false },
  { id: 'three', label: 'Read chapter 4 notes', done: false },
  { id: 'four', label: 'Plan tomorrow’s session', done: false },
]

export function PlannerPreview() {
  const [tasks, setTasks] = useState(initialTasks)

  const toggle = (id: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )
  }

  const complete = tasks.filter((task) => task.done).length

  return (
    <div className="sf-plan">
      <div className="sf-plan__col">
        <h4>Focus timer</h4>
        <div className="sf-plan__timer">
          <strong>24:18</strong>
          <span>Work · 25 minutes</span>
        </div>
        <p className="sf-small" style={{ marginTop: 12 }}>
          {complete} of {tasks.length} tasks complete
        </p>
      </div>

      <div className="sf-plan__col">
        <h4>Today</h4>
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className="sf-plan__task"
            aria-pressed={task.done}
            onClick={() => toggle(task.id)}
          >
            <span className="sf-plan__box" aria-hidden="true">
              {task.done && <Check width={10} height={10} strokeWidth={3} />}
            </span>
            <span>{task.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export function ProgressPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const progress = 0.72

  return (
    <div className="sf-progress-preview" ref={ref}>
      <div className="sf-progress-preview__panel">
        <h4>Weekly activity</h4>
        <div className="sf-ring">
          <svg viewBox="0 0 82 82" aria-hidden="true">
            <circle cx="41" cy="41" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <motion.circle
              cx="41"
              cy="41"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={reduced ? false : { strokeDashoffset: circumference }}
              animate={
                reduced || inView
                  ? { strokeDashoffset: circumference * (1 - progress) }
                  : undefined
              }
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="sf-ring__value">72%</span>
        </div>
        <p className="sf-progress__label">Goal consistency</p>
        <div className="sf-bars">
          <div className="sf-bar">
            <span>Cards</span>
            <span className="sf-bar__track">
              <span className="sf-bar__fill" style={{ width: '68%' }} />
            </span>
          </div>
          <div className="sf-bar">
            <span>Quizzes</span>
            <span className="sf-bar__track">
              <span className="sf-bar__fill" style={{ width: '81%' }} />
            </span>
          </div>
          <div className="sf-bar">
            <span>Focus</span>
            <span className="sf-bar__track">
              <span className="sf-bar__fill" style={{ width: '54%' }} />
            </span>
          </div>
        </div>
      </div>

      <div className="sf-progress-preview__panel">
        <h4>From your local data</h4>
        <div className="sf-progress-preview__stat">
          <span>Cards reviewed</span>
          <strong>46</strong>
        </div>
        <div className="sf-progress-preview__stat">
          <span>Quiz average</span>
          <strong>81%</strong>
        </div>
        <div className="sf-progress-preview__stat">
          <span>Study sessions</span>
          <strong>9</strong>
        </div>
        <h4 style={{ marginTop: 16 }}>Needs attention</h4>
        <div className="sf-weak">
          <span>Cell division</span>
          <span>Trigonometry</span>
          <span>Essay structure</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */

const libraryItems = [
  {
    icon: BookOpen,
    title: 'Photosynthesis, explained',
    meta: 'AI lesson · saved yesterday',
  },
  {
    icon: Layers,
    title: 'Biology · Cell division',
    meta: 'Deck · 24 cards, 6 due',
  },
  {
    icon: ClipboardCheck,
    title: 'Algebra practice',
    meta: 'Quiz · 10 questions, 80%',
  },
]

export function LibraryPreview() {
  return (
    <div className="sf-library">
      {libraryItems.map((item) => {
        const Icon = item.icon
        return (
          <div className="sf-library__item" key={item.title}>
            <span className="sf-library__icon" aria-hidden="true">
              <Icon width={15} height={15} />
            </span>
            <span className="sf-library__text">
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </span>
            <ArrowUpRight className="sf-library__open" width={14} height={14} aria-hidden="true" />
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Small composed preview used inside the hero                                */
/* -------------------------------------------------------------------------- */

export function HeroLessonCard() {
  return (
    <div className="sf-window">
      <div className="sf-window__bar">
        <span className="sf-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-window__title">Learn · AI teacher</span>
      </div>
      <div className="sf-window__body">
        <div className="sf-chat">
          <div className="sf-chat__bubble sf-chat__bubble--user">Explain recursion with a simple example.</div>
          <div className="sf-chat__bubble sf-chat__bubble--ai">
            <span className="sf-chat__label">
              <Sparkles width={10} height={10} aria-hidden="true" /> Studifree
            </span>
            Think of a set of nested boxes. To open the last box, you first open the box around it — the
            same step, on a smaller problem.
          </div>
        </div>
        <div className="sf-input">
          <span>Ask a follow-up…</span>
          <span className="sf-input__send" aria-hidden="true">
            <Send width={11} height={11} />
          </span>
        </div>
      </div>
    </div>
  )
}

export function HeroFlashcardCard() {
  return (
    <div className="sf-flashcard">
      <div className="sf-flashcard__meta">
        <span>Flashcards</span>
        <span>7 / 24</span>
      </div>
      <p className="sf-flashcard__question">What is the derivative of x²?</p>
      <span className="sf-flashcard__hint">Tap to reveal</span>
    </div>
  )
}

export function HeroQuizCard() {
  return (
    <div className="sf-window">
      <div className="sf-window__bar">
        <span className="sf-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-window__title">Quiz Studio</span>
      </div>
      <div className="sf-window__body">
        <div className="sf-mini-heading">
          <strong>Question 3 of 10</strong>
          <span>Exam</span>
        </div>
        <p className="sf-quiz__question">Which process releases oxygen into the atmosphere?</p>
        <div className="sf-quiz__options">
          <span className="sf-quiz__option sf-quiz__option--correct">Photosynthesis</span>
          <span className="sf-quiz__option">Respiration</span>
        </div>
      </div>
    </div>
  )
}

export function HeroProgressCard() {
  return (
    <div className="sf-window">
      <div className="sf-window__bar">
        <span className="sf-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-window__title">Progress</span>
      </div>
      <div className="sf-window__body">
        <div className="sf-ring">
          <svg viewBox="0 0 82 82" aria-hidden="true">
            <circle cx="41" cy="41" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="41"
              cy="41"
              r="32"
              fill="none"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * 0.28}
            />
          </svg>
          <span className="sf-ring__value">72%</span>
        </div>
        <p className="sf-progress__label">This week</p>
      </div>
    </div>
  )
}

export function HeroPlannerCard() {
  const rows = [
    { label: 'Review deck', done: true },
    { label: 'Algebra quiz', done: false },
    { label: 'Focus 25 min', done: false },
  ]
  return (
    <div className="sf-window">
      <div className="sf-window__bar">
        <span className="sf-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sf-window__title">Planner</span>
      </div>
      <div className="sf-window__body">
        {rows.map((row) => (
          <div className="sf-planner__row" key={row.label}>
            <span
              className={cx('sf-planner__check', row.done && 'sf-planner__check--done')}
              aria-hidden="true"
            >
              {row.done && <Check width={9} height={9} strokeWidth={3} />}
            </span>
            <span>{row.label}</span>
            <span className="sf-planner__time">Today</span>
          </div>
        ))}
      </div>
    </div>
  )
}
