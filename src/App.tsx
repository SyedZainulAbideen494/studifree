import React, { Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { BottomNav } from './components/Navigation/BottomNav'
import { Skeleton } from './components/UI/Skeleton'
import { Toasts } from './components/Notifications/Toasts'
import { AiKeyBanner } from './components/AI/AiKeyBanner'
import { AiSetupModal } from './components/AI/AiSetupModal'
import { LocationConsentGate } from './components/Consent/LocationConsent'
import { useDocumentMeta } from './hooks/useDocumentMeta'

const Home = lazy(() => import('./pages/Home'))
const Learn = lazy(() => import('./pages/Learn'))
const Practice = lazy(() => import('./pages/Practice'))
const Progress = lazy(() => import('./pages/Progress'))
const Library = lazy(() => import('./pages/Library'))
const Planner = lazy(() => import('./pages/Planner'))
const Help = lazy(() => import('./pages/Help'))
const About = lazy(() => import('./pages/About'))
const Settings = lazy(() => import('./pages/Settings'))
const AiSetup = lazy(() => import('./pages/AiSetup'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const QuizStudio = lazy(() => import('./pages/QuizStudio'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

function Fallback() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

/**
 * The public landing page renders before the application shell. It has its
 * own navigation and must not inherit the AI banner, bottom bar, consent gate
 * or app padding.
 */
function LandingFallback() {
  return <div style={{ minHeight: '100vh', background: '#050505' }} aria-hidden="true" />
}

export default function App() {
  const location = useLocation()
  useDocumentMeta()

  if (location.pathname === '/') {
    return (
      <Suspense fallback={<LandingFallback />}>
        <LandingPage />
      </Suspense>
    )
  }

  if (location.pathname === '/landing' || location.pathname === '/landing/') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-full pb-28">
      <AiKeyBanner />
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/library" element={<Library />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-setup" element={<AiSetup />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz" element={<QuizStudio />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </Suspense>
      <BottomNav />
      <Toasts />
      <AiSetupModal />
      <LocationConsentGate />
    </div>
  )
}
