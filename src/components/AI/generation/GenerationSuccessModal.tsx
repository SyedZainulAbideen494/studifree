import React from 'react'
import {
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../../UI/Button'
import { GenerationModalShell } from './GenerationModalShell'

export interface GenerationSummary {
  label: string
  value: string
}

export interface GenerationPreviewCard {
  front: string
  back?: string
}

export interface GenerationAction {
  label: string
  onClick: () => void
}

interface Props {
  open: boolean
  heading: string
  message: string
  kind?: 'flashcards' | 'quiz' | 'lesson' | 'document' | 'notes'
  summary?: GenerationSummary[]
  preview?: GenerationPreviewCard[]
  previewLabel?: string
  primary: GenerationAction
  secondary?: GenerationAction
  tertiary?: GenerationAction
  fallbackNote?: string
  saved?: boolean
  onClose: () => void
}

const kindIcon = {
  flashcards: Layers,
  quiz: ClipboardCheck,
  lesson: BookOpen,
  document: FileText,
  notes: FileText,
}

export function GenerationSuccessModal({
  open,
  heading,
  message,
  kind = 'flashcards',
  summary,
  preview,
  previewLabel = 'A quick look at your cards',
  primary,
  secondary,
  tertiary,
  fallbackNote,
  saved = true,
  onClose,
}: Props) {
  const reduced = useReducedMotion()
  const Icon = kindIcon[kind] ?? Sparkles

  return (
    <GenerationModalShell open={open} onClose={onClose} labelledBy="sf-generation-success-heading">
      <button type="button" className="sf-gen-close" onClick={onClose} aria-label="Close success dialog">
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="sf-gen-success">
        <div className="sf-gen-success__badge" aria-hidden="true">
          {!reduced && (
            <span className="sf-gen-success__particles">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <i key={index} className={`sf-gen-success__particle sf-gen-success__particle--${index}`} />
              ))}
            </span>
          )}
          <motion.span
            className="sf-gen-success__disc"
            initial={reduced ? false : { scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          >
            <motion.svg viewBox="0 0 52 52" className="sf-gen-success__check" aria-hidden="true">
              <motion.path
                d="M14 27.5 22.5 36 38 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.42, ease: 'easeOut', delay: reduced ? 0 : 0.16 }}
              />
            </motion.svg>
          </motion.span>
        </div>

        <p className="sf-gen-eyebrow sf-gen-eyebrow--center">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          Ready to use
        </p>
        <h2 id="sf-generation-success-heading" className="sf-gen-title sf-gen-title--center">
          {heading}
        </h2>
        <p className="sf-gen-copy sf-gen-copy--center">{message}</p>

        {summary && summary.length > 0 && (
          <dl className="sf-gen-summary">
            {summary.map((item) => (
              <div key={item.label} className="sf-gen-summary__row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {preview && preview.length > 0 && (
          <div className="sf-gen-preview">
            <p className="sf-gen-preview__label">{previewLabel}</p>
            <ul>
              {preview.slice(0, 3).map((card, index) => (
                <li key={`${card.front}-${index}`}>
                  <span className="sf-gen-preview__index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="sf-gen-preview__front">{card.front}</p>
                    {card.back && <p className="sf-gen-preview__back">{card.back}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {fallbackNote && (
          <p className="sf-gen-note">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{fallbackNote}</span>
          </p>
        )}

        <div className="sf-gen-actions">
          <Button onClick={primary.onClick} className="w-full" data-autofocus>
            {primary.label}
          </Button>
          {secondary && (
            <Button variant="secondary" onClick={secondary.onClick} className="w-full">
              {secondary.label}
            </Button>
          )}
          {tertiary && (
            <button type="button" className="sf-gen-tertiary" onClick={tertiary.onClick}>
              {tertiary.label}
            </button>
          )}
        </div>

        {saved && (
          <p className="sf-gen-trust">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Saved to this browser
          </p>
        )}
      </div>
    </GenerationModalShell>
  )
}
