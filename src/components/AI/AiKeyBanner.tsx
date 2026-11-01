import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, AlertTriangle, X, ArrowRight } from 'lucide-react'
import { Button } from '../UI/Button'
import { useAiAvailability } from '../../hooks/useAiAvailability'
import { useAiUiStore } from '../../store/useAiUiStore'

const DISMISS_KEY = 'studifree:ai-banner-dismissed'

/**
 * Persistent, dismissible notice shown when AI cannot be used yet.
 * It sits in normal document flow, so it never covers the page.
 */
export const AiKeyBanner: React.FC = () => {
  const ai = useAiAvailability()
  const openSetupGuide = useAiUiStore((s) => s.openSetup)
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  const wasPresent = useRef(ai.keyPresent)

  // Saving a key clears the dismissal so the notice disappears; removing a
  // key later restores it immediately in the same session.
  useEffect(() => {
    const hadKey = wasPresent.current
    wasPresent.current = ai.keyPresent
    if (!ai.keyPresent && !hadKey) return
    try {
      sessionStorage.removeItem(DISMISS_KEY)
    } catch {
      /* ignore */
    }
    setDismissed(false)
  }, [ai.keyPresent])

  if (!ai.requiresSetup || dismissed) return null
  // The setup page already contains the full explanation and key form.
  if (location.pathname === '/ai-setup') return null

  const invalid = ai.status !== 'missing'

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { y: -10, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      className="px-3 pt-3"
    >
      <div
        role="status"
        aria-live="polite"
        className="max-w-3xl mx-auto glass rounded-2xl border border-line-strong shadow-soft px-3.5 py-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-soft border border-line flex items-center justify-center shrink-0">
            {invalid ? (
              <AlertTriangle className="w-4 h-4 text-ink" />
            ) : (
              <Sparkles className="w-4 h-4 text-ink" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {invalid ? 'Your AI key needs attention' : 'Your own AI is one step away'}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {invalid
                    ? ai.message
                    : 'Connect your own Gemini API key to turn topics into explanations, notes, flashcards and quizzes. Setup takes approximately 1–2 minutes.'}
                </p>
                {invalid && ai.detail && (
                  <p className="text-[11px] text-faint mt-1 break-words">{ai.detail}</p>
                )}
              </div>
              <button
                onClick={dismiss}
                className="p-1 rounded-lg text-faint hover:text-ink hover:bg-accent-soft transition shrink-0"
                aria-label="Dismiss AI notification for this session"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <Button size="sm" onClick={() => navigate('/ai-setup')}>
                {invalid ? 'Review AI setup' : 'Connect my AI'}
              </Button>
              <Button size="sm" variant="ghost" onClick={openSetupGuide}>
                Why do I need one? <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
