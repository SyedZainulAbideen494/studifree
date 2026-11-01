import React from 'react'
import { Key, ExternalLink, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { useNavigate } from 'react-router-dom'
import { useAiAvailability } from '../../hooks/useAiAvailability'
import { useAiUiStore } from '../../store/useAiUiStore'
import { aiLinks } from '../../data/aiLinks'

interface Props {
  feature?: string
  onDismiss?: () => void
  compact?: boolean
  className?: string
}

/**
 * Shared AI-required state. Used anywhere an AI action needs a key so the
 * messaging, links and next steps stay consistent.
 */
export const NoApiKeyPrompt: React.FC<Props> = ({
  feature = 'AI-powered learning',
  onDismiss,
  compact = false,
  className,
}) => {
  const navigate = useNavigate()
  const ai = useAiAvailability()
  const openGuide = useAiUiStore((s) => s.openSetup)
  const needsAttention = ai.status !== 'missing' && ai.requiresSetup

  return (
    <Card glass className={`border-line-strong ${className ?? ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-accent-soft flex items-center justify-center shrink-0">
          {needsAttention ? (
            <AlertTriangle className="w-5 h-5 text-ink" aria-hidden="true" />
          ) : (
            <Sparkles className="w-5 h-5 text-ink" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-ink mb-1">
            {needsAttention ? 'Your AI key needs attention' : 'Your own AI is one step away.'}
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-3">
            {needsAttention
              ? ai.message
              : `Connect your own Gemini API key to use ${feature}. Setup takes approximately 1–2 minutes, and manual study tools keep working without it.`}
          </p>

          {needsAttention && ai.detail && (
            <p className="text-xs text-faint mb-3 break-words">{ai.detail}</p>
          )}

          {!compact && (
            <ol className="text-sm text-muted space-y-1 mb-4 list-decimal pl-5">
              <li>
                Open{' '}
                <a
                  href={aiLinks.apiKey}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{' '}
                and sign in with your Google account.
              </li>
              <li>
                Click <span className="text-ink">Create API key</span> and copy the key.
              </li>
              <li>
                Return here, open <span className="text-ink">AI Setup</span>, paste the key and press{' '}
                <span className="text-ink">Connect my AI</span>.
              </li>
            </ol>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/ai-setup')}>
              <Key className="w-4 h-4" aria-hidden="true" /> Connect my AI
            </Button>
            <Button variant="secondary" onClick={openGuide}>
              Why do I need this?
            </Button>
            {onDismiss && (
              <Button variant="ghost" onClick={onDismiss}>
                I&apos;ll do this later
              </Button>
            )}
          </div>

          {!compact && (
            <>
              <div className="flex items-start gap-2 mt-4 text-xs text-faint">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Your key is stored locally in this browser and is tested before it is saved. Anyone
                  with access to this browser profile can read it, so avoid shared devices. Google may
                  apply its own quotas or charges.
                </span>
              </div>

              <p className="text-xs text-faint mt-2">
                You can still study without AI: create manual flashcards, build manual quizzes, use the
                focus timer and keep notes locally.
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

interface AiRequiredProps {
  feature?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/** Gate an AI-only area; manual areas outside it stay available. */
export const AiRequired: React.FC<AiRequiredProps> = ({ feature, children, fallback }) => {
  const ai = useAiAvailability()
  if (ai.requiresSetup) return <>{fallback ?? <NoApiKeyPrompt feature={feature} />}</>
  return <>{children}</>
}
