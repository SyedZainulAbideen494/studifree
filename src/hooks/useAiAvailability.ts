import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAiUiStore } from '../store/useAiUiStore'
import { getAiAvailability, type AiAvailability } from '../services/ai/availability'

/** Central, reactive AI availability check shared by every AI entry point. */
export function useAiAvailability(): AiAvailability {
  const settings = useAppStore((s) => s.settings)
  const revision = useAiUiStore((s) => s.verificationRevision)
  return useMemo(() => getAiAvailability(settings), [settings, revision])
}
