import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, Sparkles, Download, Upload, Trash2, RotateCcw, MapPin, ShieldCheck, Globe2, Send } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Card } from '../components/UI/Card'
import { Switch } from '../components/UI/Switch'
import { SparkleToggle } from '../components/Effects/SparkleToggle'
import { useAppStore } from '../store/useAppStore'
import { db } from '../db'
import { useAiAvailability } from '../hooks/useAiAvailability'
import { notify } from '../store/useAiEventsStore'
import {
  clearLocationConsent,
  clearRegionalProfile,
  declineLocation,
  describeRegion,
  getAnalyticsLocationConsent,
  getCurrentCoordinates,
  getLocationPreference,
  resolveRegionalProfile,
  setAnalyticsLocationConsent,
  updateRegionalProfile,
  watchBrowserLocationPermission,
  LOCATION_PREFERENCE_CHANGED_EVENT,
  type BrowserLocationPermission,
} from '../services/location'
import { sendLocationEmail } from '../services/visitorTracking'

export default function Settings() {
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const update = useAppStore((s) => s.updateSettings)
  const setTheme = useAppStore((s) => s.setTheme)
  const toggleEffects = useAppStore((s) => s.toggleEffects)
  const ai = useAiAvailability()
  const [locationPref, setLocationPref] = useState(getLocationPreference)
  const [browserPermission, setBrowserPermission] = useState<BrowserLocationPermission>('unsupported')
  const [analyticsLocation, setAnalyticsLocation] = useState(getAnalyticsLocationConsent)
  const [analyticsBusy, setAnalyticsBusy] = useState(false)
  const [regionBusy, setRegionBusy] = useState(false)
  const [work, setWork] = useState(settings.pomodoroWork)
  const [brk, setBrk] = useState(settings.pomodoroBreak)
  const [goal, setGoal] = useState(settings.studyGoalMinutes)

  useEffect(() => {
    const sync = () => {
      setLocationPref(getLocationPreference())
      setAnalyticsLocation(getAnalyticsLocationConsent())
    }
    window.addEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    const unsubscribePermission = watchBrowserLocationPermission(setBrowserPermission)
    return () => {
      window.removeEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
      unsubscribePermission()
    }
  }, [])

  const locationGranted = locationPref?.status === 'granted'
  const regionLabel = describeRegion(locationPref?.profile)
  const locationStatusLabel = locationGranted
    ? regionLabel
      ? `On · ${regionLabel}`
      : 'On · region not detected'
    : locationPref?.status === 'declined'
      ? 'Off'
      : 'Not set'

  const browserPermissionLabel =
    browserPermission === 'granted'
      ? 'Allowed'
      : browserPermission === 'denied'
        ? 'Blocked in browser'
        : browserPermission === 'prompt'
          ? 'Ask when needed'
          : 'Not supported in this browser'

  const disablePersonalisation = () => {
    declineLocation()
    setLocationPref(getLocationPreference())
  }

  const changePreference = () => {
    clearLocationConsent()
    setLocationPref(null)
    notify(
      'info',
      'Location preference cleared',
      'You can make a new choice the next time the location prompt appears.',
    )
  }

  const clearSavedLocation = () => {
    clearRegionalProfile()
    setLocationPref(getLocationPreference())
    notify(
      'success',
      'Saved region cleared',
      'Your stored country or region was removed. Location personalisation remains ' +
        (locationGranted ? 'on without a region.' : 'off.'),
    )
  }

  const sendAnalyticsLocation = async () => {
    if (analyticsBusy) return
    setAnalyticsBusy(true)
    try {
      const coords = await getCurrentCoordinates()
      const sent = await sendLocationEmail({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      })
      notify(
        sent ? 'success' : 'warning',
        sent ? 'Location sent' : 'Location not sent',
        sent
          ? 'Your coordinates were included in the anonymous visitor notification.'
          : 'The notification could not be sent. This does not affect Studifree.',
      )
    } catch {
      notify(
        'warning',
        'Location unavailable',
        'Your browser did not provide a location. Studifree continues to work normally.',
      )
    } finally {
      setAnalyticsBusy(false)
    }
  }

  const refreshRegion = async () => {
    if (regionBusy) return
    if (browserPermission === 'denied') {
      notify(
        'warning',
        'Browser location is blocked',
        'Allow location for this site in your browser settings before refreshing the region.',
      )
      return
    }
    setRegionBusy(true)
    try {
      const coords = await getCurrentCoordinates()
      const profile = await resolveRegionalProfile(coords)
      updateRegionalProfile(profile)
      setLocationPref(getLocationPreference())
      notify(
        profile ? 'success' : 'warning',
        profile ? 'Region updated' : 'Region not detected',
        profile
          ? `Regional context now uses ${describeRegion(profile)} when a feature needs it.`
          : 'We could not determine your region just now. Your location choice is unchanged.',
      )
    } catch {
      notify(
        'warning',
        'Location unavailable',
        'Your browser did not provide a location. Studifree continues to work normally.',
      )
    } finally {
      setRegionBusy(false)
    }
  }

  const exportData = async () => {
    const data = {
      settings,
      lessons: await db.lessons.toArray(),
      decks: await db.decks.toArray(),
      cards: await db.cards.toArray(),
      quizzes: await db.quizzes.toArray(),
      quizResults: await db.quizResults.toArray(),
      concepts: await db.concepts.toArray(),
      sessions: await db.sessions.toArray(),
      planner: await db.planner.toArray(),
      goals: await db.goals.toArray(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'studifree-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.lessons) await db.lessons.bulkPut(data.lessons)
      if (data.decks) await db.decks.bulkPut(data.decks)
      if (data.cards) await db.cards.bulkPut(data.cards)
      if (data.quizzes) await db.quizzes.bulkPut(data.quizzes)
      if (data.quizResults) await db.quizResults.bulkPut(data.quizResults)
      if (data.concepts) await db.concepts.bulkPut(data.concepts)
      if (data.sessions) await db.sessions.bulkPut(data.sessions)
      if (data.planner) await db.planner.bulkPut(data.planner)
      if (data.goals) await db.goals.bulkPut(data.goals)
      if (data.settings) update(data.settings)
      alert('Import complete.')
    } catch (e: any) {
      alert('Import failed: ' + (e?.message ?? e))
    }
  }

  const clearAll = async () => {
    if (!confirm('Delete ALL local data? This cannot be undone.')) return
    await db.delete()
    localStorage.clear()
    location.reload()
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Theme</h2>
        <div className="flex gap-2">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 ${settings.theme === t ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-muted border-line'}`}>
              {t === 'dark' && <Moon className="w-4 h-4" />}
              {t === 'light' && <Sun className="w-4 h-4" />}
              {t === 'system' && <Monitor className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Effects</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink">Ambient effects</span>
          <SparkleToggle checked={settings.effectsEnabled} onChange={toggleEffects} label="Toggle effects" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">Reduced motion</span>
          <Switch checked={settings.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Pomodoro durations</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Work (min)" type="number" value={work} onChange={(e) => setWork(Number(e.target.value))} />
          <Input label="Break (min)" type="number" value={brk} onChange={(e) => setBrk(Number(e.target.value))} />
        </div>
        <Button className="mt-3" onClick={() => update({ pomodoroWork: work, pomodoroBreak: brk })}>Save</Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Study goal</h2>
        <div className="flex gap-2">
          <Input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
          <Button onClick={() => update({ studyGoalMinutes: goal })}>Save</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">AI learning assistant</h2>
        <div className="flex items-start gap-2 mb-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              ai.status === 'connected' || ai.status === 'unverified'
                ? 'bg-ink'
                : ai.status === 'failed' || ai.status === 'invalid-model'
                  ? 'bg-line-strong border border-line-strong'
                  : 'bg-faint'
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm text-ink">{ai.message}</p>
            {ai.model && <p className="text-xs text-faint mt-0.5 break-all">{ai.model}</p>}
            {ai.status === 'failed' && ai.detail && (
              <p className="text-xs text-faint mt-1 break-words">{ai.detail}</p>
            )}
            {ai.status === 'missing' && (
              <p className="text-xs text-faint mt-1">
                Setup takes approximately 1–2 minutes. Manual study tools work without it.
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => navigate('/ai-setup')}>
          {ai.status === 'missing'
            ? 'Connect my AI'
            : ai.requiresSetup
              ? 'Review AI setup'
              : 'Manage AI setup'}
        </Button>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            <Globe2 className="w-4 h-4 text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-ink">Location personalisation</h2>
            <p className="text-sm text-ink mt-1">{locationStatusLabel}</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Only your country or region is stored, never precise coordinates. Location is used only when a
              feature can benefit, and regional context in AI is off by default for each request.
            </p>
            <dl className="mt-3 grid gap-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Studifree preference</dt>
                <dd className="text-ink text-right">
                  {locationPref?.status === 'granted'
                    ? 'Granted'
                    : locationPref?.status === 'declined'
                      ? 'Declined'
                      : 'Not chosen'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Browser permission</dt>
                <dd className="text-ink text-right">{browserPermissionLabel}</dd>
              </div>
            </dl>
            <p className="text-xs text-faint mt-2 leading-relaxed">
              Studifree asks once per browser. To revoke the browser&apos;s own permission completely, use your
              browser&apos;s site settings for this website.
            </p>
            {browserPermission === 'denied' && (
              <p className="text-xs text-ink mt-2 rounded-xl border border-line bg-inset px-3 py-2 leading-relaxed">
                Your browser is blocking location for this site. Studifree will not request coordinates. You can
                clear any saved region below, or allow location in your browser settings and then refresh.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {locationGranted && (
            <>
              <Button size="sm" variant="secondary" onClick={disablePersonalisation}>
                Turn off personalisation
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshRegion}
                loading={regionBusy}
                disabled={browserPermission === 'denied'}
              >
                <Globe2 className="w-4 h-4" />
                {regionLabel ? 'Refresh region' : 'Detect region'}
              </Button>
            </>
          )}
          {locationPref?.profile && (
            <Button size="sm" variant="ghost" onClick={clearSavedLocation}>
              <Trash2 className="w-4 h-4" /> Clear saved region
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={changePreference}>
            <MapPin className="w-4 h-4" /> {locationPref ? 'Change preference' : 'Choose preference'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/privacy')}>
            <ShieldCheck className="w-4 h-4" /> Privacy policy
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-line">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink">Location in visitor analytics</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Separate from personalisation and off by default. When on, this visit&apos;s precise
                coordinates can be included in the anonymous visitor notification.
              </p>
              {!locationGranted && (
                <p className="text-xs text-faint mt-1">
                  Allow location personalisation first. Visitor analytics never reads location on its own.
                </p>
              )}
            </div>
            <Switch
              checked={analyticsLocation}
              ariaLabel="Include location in visitor analytics"
              disabled={!locationGranted && !analyticsLocation}
              onChange={(value) => {
                setAnalyticsLocationConsent(value)
                setAnalyticsLocation(value)
              }}
            />
          </div>

          {locationGranted && analyticsLocation && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={sendAnalyticsLocation}
              loading={analyticsBusy}
              disabled={browserPermission === 'denied'}
            >
              {analyticsBusy ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send this visit&apos;s location
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Onboarding</h2>
        <Button variant="secondary" onClick={() => { update({ onboardingDone: false }); navigate('/onboarding') }}>
          <RotateCcw className="w-4 h-4" /> Replay onboarding
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Data</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData}><Download className="w-4 h-4" /> Export data</Button>
          <label className="inline-flex">
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f) }} />
            <Button variant="secondary"><Upload className="w-4 h-4" /> Import data</Button>
          </label>
          <Button variant="danger" onClick={clearAll}><Trash2 className="w-4 h-4" /> Clear all data</Button>
        </div>
      </Card>
    </div>
  )
}
