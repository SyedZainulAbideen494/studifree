import React from 'react'
import { clsx } from 'clsx'

const steps = ['Get your key', 'Connect your key', 'Start learning']

interface Props {
  /** 1-based current step. */
  current: 1 | 2 | 3
  className?: string
}

/** Small, accessible three-step progress indicator for AI onboarding. */
export const SetupProgress: React.FC<Props> = ({ current, className }) => (
  <nav aria-label="AI setup progress" className={className}>
    <ol className="flex items-start gap-1 sm:gap-2">
      {steps.map((label, index) => {
        const number = (index + 1) as 1 | 2 | 3
        const done = number < current
        const active = number === current
        return (
          <li
            key={label}
            className="flex-1 min-w-0"
            aria-current={active ? 'step' : undefined}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-colors shrink-0',
                  done && 'bg-accent text-accent-ink border-accent',
                  active && 'bg-accent-soft text-ink border-line-strong',
                  !done && !active && 'bg-surface text-faint border-line',
                )}
                aria-hidden="true"
              >
                {done ? <span className="text-xs">✓</span> : number}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={clsx('h-px flex-1 rounded-full', done ? 'bg-line-strong' : 'bg-line')}
                  aria-hidden="true"
                />
              )}
            </div>
            <p
              className={clsx(
                'mt-1.5 text-[11px] sm:text-xs leading-snug truncate',
                active ? 'text-ink font-medium' : done ? 'text-muted' : 'text-faint',
              )}
            >
              {label}
            </p>
          </li>
        )
      })}
    </ol>
  </nav>
)
