import React from 'react'
import { Key, ExternalLink, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { useNavigate } from 'react-router-dom'
import { useAiAvailability } from '../../hooks/useAiAvailability'
import { useAiUiStore } from '../../store/useAiUiStore'

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
            <AlertTriangle className="w-5 h-5 text-ink" />
          ) : (
            <Sparkles className="w-5 h-5 text-ink" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-ink mb-1">
            {needsAttention ? 'Your AI key needs attention' : 'Your AI learning assistant is waiting.'}
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-3">
            {needsAttention
              ? ai.message
              : `Add your Gemini API key to start generating ${feature}. It takes about a minute, and manual study tools keep working without it.`}
          </p>

          {needsAttention && ai.detail && (
            <p className="text-xs text-faint mb-3 break-words">{ai.detail}</p>
          )}

          {!compact && (
            <ol className="text-sm text-muted space-y-1 mb-4 list-decimal pl-5">
              <li>
                Open{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
                </a>{' '}
                and sign in with a Google account.
              </li>
              <li>Press <span className="text-ink">Create API key</span> and copy it.</li>
              <li>Return to Studifree, open <span className="text-ink">AI Setup</span>, paste the key and save.</li>
              <li>Press <span className="text-ink">Test connection</span>. If it works, come back and try again.</li>
            </ol>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/ai-setup')}>
              <Key className="w-4 h-4" /> Set up AI
            </Button>
            <Button variant="secondary" onClick={openGuide}>
              Why do I need this?
            </Button>
            {onDismiss && (
              <Button variant="ghost" onClick={onDismiss}>
                Not now
              </Button>
            )}
          </div>

          {!compact && (
            <>
              <div className="flex items-start gap-2 mt-4 text-xs text-faint">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your key is stored locally in this browser. Anyone with access to this browser profile can read
                  it, so avoid shared devices. You can remove it anytime in AI Setup. Google may apply its own
                  quotas or charges.
                </span>
              </div>

              <p className="text-xs text-faint mt-2">
                You can still study without AI: create manual flashcards, build manual quizzes, use the focus timer
                and keep notes locally.
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
