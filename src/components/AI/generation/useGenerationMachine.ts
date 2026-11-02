import { useCallback, useEffect, useRef, useState } from 'react'

export type GenerationStatus = 'idle' | 'generating' | 'validating' | 'saving' | 'success' | 'error'

export type GenerationTask = 'flashcards' | 'quiz' | 'notes' | 'lesson' | 'document' | 'general'

export interface GenerationState {
  status: GenerationStatus
  taskType: GenerationTask
  error: string | null
  startedAt: number | null
}

const IDLE: GenerationState = {
  status: 'idle',
  taskType: 'general',
  error: null,
  startedAt: null,
}

export interface GenerationMachine {
  status: GenerationStatus
  taskType: GenerationTask
  error: string | null
  startedAt: number | null
  busy: boolean
  begin: (taskType?: GenerationTask) => boolean
  setStatus: (status: Extract<GenerationStatus, 'generating' | 'validating' | 'saving'>) => void
  succeed: () => void
  fail: (message: string) => void
  reset: () => void
}

/**
 * Small, explicit state machine shared by every AI generation surface.
 *
 * `begin` is guarded by a ref as well as state so a double click cannot start
 * two requests before React has re-rendered the first one.
 */
export function useGenerationMachine(taskType: GenerationTask = 'general'): GenerationMachine {
  const [state, setState] = useState<GenerationState>({ ...IDLE, taskType })
  const busyRef = useRef(false)

  const begin = useCallback((nextTask?: GenerationTask) => {
    if (busyRef.current) return false
    busyRef.current = true
    setState({
      status: 'generating',
      taskType: nextTask ?? taskType,
      error: null,
      startedAt: Date.now(),
    })
    return true
  }, [taskType])

  const setStatus = useCallback((status: 'generating' | 'validating' | 'saving') => {
    setState((current) => ({ ...current, status }))
  }, [])

  const succeed = useCallback(() => {
    busyRef.current = false
    setState((current) => ({ ...current, status: 'success', error: null }))
  }, [])

  const fail = useCallback((message: string) => {
    busyRef.current = false
    setState((current) => ({ ...current, status: 'error', error: message }))
  }, [])

  const reset = useCallback(() => {
    busyRef.current = false
    setState({ ...IDLE, taskType })
  }, [taskType])

  const busy =
    state.status === 'generating' || state.status === 'validating' || state.status === 'saving'

  return { ...state, busy, begin, setStatus, succeed, fail, reset }
}

/**
 * Delay showing the waiting overlay so a fast response never flashes a modal.
 * The overlay hides immediately when the operation stops.
 */
export function useDelayedVisibility(active: boolean, delay = 420): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const timer = window.setTimeout(() => setVisible(true), delay)
    return () => window.clearTimeout(timer)
  }, [active, delay])

  return active && visible
}

/** Human-readable stage copy for the status indicator. */
export const stageLabels: Record<Exclude<GenerationStatus, 'idle' | 'success' | 'error'>, string> = {
  generating: 'Generating',
  validating: 'Checking',
  saving: 'Saving',
}
