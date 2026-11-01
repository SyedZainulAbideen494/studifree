import { create } from 'zustand'

interface AiUiState {
  setupOpen: boolean
  openSetup: () => void
  closeSetup: () => void
  /** Bumped whenever a connection test finishes, so availability re-renders. */
  verificationRevision: number
  bumpVerification: () => void
}

export const useAiUiStore = create<AiUiState>((set) => ({
  setupOpen: false,
  openSetup: () => set({ setupOpen: true }),
  closeSetup: () => set({ setupOpen: false }),
  verificationRevision: 0,
  bumpVerification: () => set((s) => ({ verificationRevision: s.verificationRevision + 1 })),
}))
