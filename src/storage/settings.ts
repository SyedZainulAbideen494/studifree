import type { AppSettings } from '../types'

const KEY = 'studifree:settings'

const defaults: AppSettings = {
  theme: 'dark',
  effectsEnabled: false,
  reducedMotion: false,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  onboardingDone: false,
  studyGoalMinutes: 30,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function patchSettings(patch: Partial<AppSettings>) {
  const cur = loadSettings()
  const next = { ...cur, ...patch }
  saveSettings(next)
  return next
}
