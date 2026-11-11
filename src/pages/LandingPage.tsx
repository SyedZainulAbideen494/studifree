import React, { useEffect } from 'react'
import '../styles/landing.css'
import { AiSetupModal } from '../components/AI/AiSetupModal'
import { LandingNavbar } from '../components/landing/LandingNavbar'
import { HeroSection } from '../components/landing/HeroSection'
import { StatementSection } from '../components/landing/StatementSection'
import { ProductExperience } from '../components/landing/ProductExperience'
import { LearningEngine } from '../components/landing/LearningEngine'
import { BrainSection } from '../components/landing/BrainSection'
import { HowItWorks } from '../components/landing/HowItWorks'
import { AiKeySection } from '../components/landing/AiKeySection'
import { FreeSection } from '../components/landing/FreeSection'
import { PrivacySection } from '../components/landing/PrivacySection'
import { ComparisonSection } from '../components/landing/ComparisonSection'
import { ModelFallback } from '../components/landing/ModelFallback'
import { StudyModes } from '../components/landing/StudyModes'
import { BeginnerSection } from '../components/landing/BeginnerSection'
import { FounderSection } from '../components/landing/FounderSection'
import { FutureMoment } from '../components/landing/FutureMoment'
import { LandingFAQ } from '../components/landing/LandingFAQ'
import { FinalCTA } from '../components/landing/FinalCTA'
import { LandingFooter } from '../components/landing/LandingFooter'
import { Atmosphere } from '../components/landing/visuals'

/**
 * Public marketing page.
 *
 * The landing page owns a deliberately dark identity: the application's saved
 * theme is restored when the visitor leaves. It renders before the app shell so
 * the floating navigation, consent prompt and bottom bar cannot intrude on the
 * public experience.
 */
export default function LandingPage() {
  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.add('dark')
    root.classList.add('sf-scroll')

    return () => {
      if (!hadDark) root.classList.remove('dark')
      root.classList.remove('sf-scroll')
    }
  }, [])

  return (
    <div className="sf-landing" id="landing">
      <a className="sf-skip" href="#main">
        Skip to content
      </a>

      <Atmosphere />
      <LandingNavbar />

      <main id="main">
        <HeroSection />
        <StatementSection />
        <ProductExperience />
        <LearningEngine />
        <BrainSection />
        <HowItWorks />
        <AiKeySection />
        <FreeSection />
        <PrivacySection />
        <ComparisonSection />
        <ModelFallback />
        <StudyModes />
        <BeginnerSection />
        <FounderSection />
        <FutureMoment />
        <LandingFAQ />
        <FinalCTA />
      </main>

      <LandingFooter />

      {/* Shared illustrated setup guide, opened from the AI key section. */}
      <AiSetupModal />
    </div>
  )
}
