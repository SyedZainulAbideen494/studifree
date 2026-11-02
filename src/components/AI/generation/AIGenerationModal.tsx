import React from 'react'
import { BookOpen, ClipboardCheck, FileText, Layers, RefreshCw, Sparkles } from 'lucide-react'
import { GenerationModalShell } from './GenerationModalShell'
import { stageLabels, type GenerationStatus, type GenerationTask } from './useGenerationMachine'

const taskIcon: Record<GenerationTask, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  flashcards: Layers,
  quiz: ClipboardCheck,
  notes: FileText,
  lesson: BookOpen,
  document: FileText,
  general: Sparkles,
}

const taskMessage: Record<GenerationTask, string> = {
  flashcards: 'Preparing your flashcards...',
  quiz: 'Building your practice questions...',
  notes: 'Organising your notes...',
  document: 'Reading and understanding your document...',
  lesson: 'Preparing your explanation...',
  general: 'Working on your request...',
}

const savingMessage: Record<GenerationTask, string> = {
  flashcards: 'Saving your new deck...',
  quiz: 'Saving your quiz...',
  notes: 'Saving your notes...',
  lesson: 'Saving your lesson...',
  document: 'Finishing your document...',
  general: 'Saving your work...',
}

const validatingMessage: Record<GenerationTask, string> = {
  flashcards: 'Checking your flashcards...',
  quiz: 'Checking your questions...',
  notes: 'Checking your notes...',
  lesson: 'Checking the explanation...',
  document: 'Checking the document...',
  general: 'Checking the result...',
}

interface Props {
  open: boolean
  status: GenerationStatus
  taskType: GenerationTask
  fallbackNote?: string
}

export function AIGenerationModal({ open, status, taskType, fallbackNote }: Props) {
  const Icon = taskIcon[taskType] ?? Sparkles
  const stage =
    status === 'validating' ? 'validating' : status === 'saving' ? 'saving' : 'generating'

  const message =
    stage === 'validating'
      ? validatingMessage[taskType]
      : stage === 'saving'
        ? savingMessage[taskType]
        : taskMessage[taskType]

  return (
    <GenerationModalShell
      open={open}
      labelledBy="sf-generation-heading"
      dismissible={false}
      className="sf-gen-panel--waiting"
    >
      <div className="sf-gen-waiting">
        <div className="sf-gen-loader" aria-hidden="true">
          <span className="sf-gen-loader__ring sf-gen-loader__ring--outer" />
          <span className="sf-gen-loader__ring sf-gen-loader__ring--inner" />
          <span className="sf-gen-loader__core">
            <Icon className="sf-gen-loader__icon" aria-hidden />
          </span>
        </div>

        <p className="sf-gen-eyebrow">
          <span className="sf-gen-live-dot" aria-hidden="true" />
          {stageLabels[stage]} · Studifree
        </p>

        <h2 id="sf-generation-heading" className="sf-gen-title">
          Good things take a moment.
        </h2>
        <p className="sf-gen-copy">
          Studifree is working on your request. This might take a few moments, so please be patient
          while we prepare everything for you.
        </p>

        <div className="sf-gen-task" role="status" aria-live="polite">
          <span className="sf-gen-task__dot" aria-hidden="true" />
          <span>{message}</span>
        </div>

        {fallbackNote && (
          <p className="sf-gen-note">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{fallbackNote}</span>
          </p>
        )}

        <p className="sf-gen-hint">You can keep this tab open. No progress percentage is shown because
          the provider does not report one.</p>
      </div>
    </GenerationModalShell>
  )
}
