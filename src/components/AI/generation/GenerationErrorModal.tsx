import React from 'react'
import { Info, RefreshCw, X } from 'lucide-react'
import { Button } from '../../UI/Button'
import { GenerationModalShell } from './GenerationModalShell'

interface Props {
  open: boolean
  message: string
  title?: string
  retryLabel?: string
  onRetry?: () => void
  onClose: () => void
  /** Set when the generated content is safe to retry saving. */
  savingFailed?: boolean
}

export function GenerationErrorModal({
  open,
  message,
  title = 'That request could not be completed.',
  retryLabel,
  onRetry,
  onClose,
  savingFailed = false,
}: Props) {
  return (
    <GenerationModalShell open={open} onClose={onClose} labelledBy="sf-generation-error-heading">
      <button type="button" className="sf-gen-close" onClick={onClose} aria-label="Close error dialog">
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="sf-gen-error">
        <span className="sf-gen-error__icon" aria-hidden="true">
          <Info className="w-5 h-5" />
        </span>

        <p className="sf-gen-eyebrow">Nothing was lost</p>
        <h2 id="sf-generation-error-heading" className="sf-gen-title">
          {title}
        </h2>
        <p className="sf-gen-copy">{message}</p>

        <div className="sf-gen-error__keep">
          {savingFailed
            ? 'Your generated content is still here. Retrying will only attempt to save it again.'
            : 'Your topic, settings and source material are still in the form, so you can try again without retyping anything.'}
        </div>

        <div className="sf-gen-actions">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              {retryLabel ?? (savingFailed ? 'Try saving again' : 'Try again')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="w-full">
            Back to editing
          </Button>
        </div>
      </div>
    </GenerationModalShell>
  )
}
