import { create } from 'zustand'
import { loadSettings, saveSettings, patchSettings } from '../storage/settings'
import type { AppSettings } from '../types'

interface AppState {
  settings: AppSettings
  setTheme: (t: AppSettings['theme']) => void
  updateSettings: (p: Partial<AppSettings>) => void
  toggleEffects: () => void
}

export const useAppStore = create<AppState>((set, get) => {
  const initial = loadSettings()
  // apply theme class
  applyTheme(initial.theme)
  return {
    settings: initial,
    setTheme: (t) => {
      const s = patchSettings({ theme: t })
      applyTheme(s.theme)
      set({ settings: s })
    },
    updateSettings: (p) => {
      const s = patchSettings(p)
      if (p.theme) applyTheme(s.theme)
      set({ settings: s })
    },
    toggleEffects: () => {
      const cur = get().settings.effectsEnabled
      const s = patchSettings({ effectsEnabled: !cur })
      set({ settings: s })
    },
  }
})

function applyTheme(t: AppSettings['theme']) {
  const root = document.documentElement
  let dark = t === 'dark'
  if (t === 'system') {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  root.classList.toggle('dark', dark)
}
