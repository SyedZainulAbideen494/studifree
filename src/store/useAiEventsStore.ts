import { create } from 'zustand'
import type { AIError, ModelSwitchEvent } from '../types/ai'

export interface Notice {
  id: string
  kind: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  technical?: string
  createdAt: number
  dismissAfterMs?: number
}

export interface ErrorRecord {
  id: string
  timestamp: number
  task: string
  model: string
  code: string
  description: string
  recovery: string
  fallbackSucceeded: boolean
  switchedTo?: string
}

interface AiEventsState {
  notices: Notice[]
  errors: ErrorRecord[]
  switches: ModelSwitchEvent[]
  pushNotice: (n: Omit<Notice, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => string
  dismissNotice: (id: string) => void
  clearNotices: () => void
  recordError: (r: Omit<ErrorRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void
  recordSwitch: (s: ModelSwitchEvent) => void
  clearErrors: () => void
}

const uid = () => `ai_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const useAiEventsStore = create<AiEventsState>((set) => ({
  notices: [],
  errors: [],
  switches: [],
  pushNotice: (n) => {
    const id = n.id ?? uid()
    const notice: Notice = { ...n, id, createdAt: n.createdAt ?? Date.now() }
    set((s) => ({ notices: [...s.notices.slice(-4), notice] }))
    if (notice.dismissAfterMs && notice.dismissAfterMs > 0) {
      setTimeout(() => set((s) => ({ notices: s.notices.filter((x) => x.id !== id) })), notice.dismissAfterMs)
    }
    return id
  },
  dismissNotice: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  clearNotices: () => set({ notices: [] }),
  recordError: (r) => set((s) => ({
    errors: [{ ...r, id: r.id ?? uid(), timestamp: r.timestamp ?? Date.now() }, ...s.errors].slice(0, 100),
  })),
  recordSwitch: (sw) => set((s) => ({ switches: [sw, ...s.switches].slice(0, 100) })),
  clearErrors: () => set({ errors: [], switches: [] }),
}))

/** Non-React helper so services can emit notices. */
export function notify(kind: Notice['kind'], title: string, message: string, technical?: string) {
  return useAiEventsStore.getState().pushNotice({ kind, title, message, technical, dismissAfterMs: kind === 'error' ? undefined : 6500 })
}

export function logAiError(record: Omit<ErrorRecord, 'id' | 'timestamp'>, error?: AIError) {
  useAiEventsStore.getState().recordError(record)
}
