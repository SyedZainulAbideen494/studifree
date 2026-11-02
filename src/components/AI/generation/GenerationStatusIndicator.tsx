import React from 'react'
import { Loader2 } from 'lucide-react'
import { stageLabels, type GenerationStatus, type GenerationTask } from './useGenerationMachine'

const labels: Record<GenerationTask, string> = {
  flashcards: 'flashcards',
  quiz: 'quiz',
  notes: 'notes',
  lesson: 'explanation',
  document: 'document',
  general: 'request',
}

interface Props {
  status: GenerationStatus
  taskType?: GenerationTask
  className?: string
}

/**
 * Compact inline indicator for places where a full modal would be too heavy
 * (for example beside a disabled Generate button).
 */
export function GenerationStatusIndicator({ status, taskType = 'general', className }: Props) {
  if (status !== 'generating' && status !== 'validating' && status !== 'saving') return null

  return (
    <span
      className={['sf-gen-status', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      {stageLabels[status]} your {labels[taskType]}…
    </span>
  )
}
