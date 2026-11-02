import React, { useEffect } from 'react'
import '../styles/landing.css'
import { AiSetupModal } from '../components/AI/AiSetupModal'
import { LandingNavbar } from '../components/landing/LandingNavbar'
import { HeroSection } from '../components/landing/HeroSection'
import { ProductIntro } from '../components/landing/ProductIntro'
import { FeatureStories } from '../components/landing/FeatureStories'
import { HowItWorks } from '../components/landing/HowItWorks'
import { FreeModelSection } from '../components/landing/FreeModelSection'
import { ApiKeyGuide } from '../components/landing/ApiKeyGuide'
import { TechnologySection } from '../components/landing/TechnologySection'
import { CreatorStory } from '../components/landing/CreatorStory'
import { Principles } from '../components/landing/Principles'
import { TrustSection } from '../components/landing/TrustSection'
import { LandingFAQ } from '../components/landing/LandingFAQ'
import { FinalCTA } from '../components/landing/FinalCTA'
import { LandingFooter } from '../components/landing/LandingFooter'

/**
 * Public marketing page.
 *
 * The landing page deliberately owns its dark identity: the application's
 * saved theme is restored when the visitor leaves. It is rendered before the
 * app shell so the floating navigation, consent prompt and bottom bar cannot
 * intrude on the public experience.
 */
export default function LandingPage() {
  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.add('dark')

    return () => {
      if (!hadDark) root.classList.remove('dark')
    }
  }, [])

  return (
    <div className="sf-landing" id="landing">
      <a className="sf-skip" href="#main">
        Skip to content
      </a>

      <LandingNavbar />

      <main id="main">
        <HeroSection />
        <ProductIntro />
        <FeatureStories />
        <HowItWorks />
        <FreeModelSection />
        <ApiKeyGuide />
        <TechnologySection />
        <CreatorStory />
        <Principles />
        <TrustSection />
        <LandingFAQ />
        <FinalCTA />
      </main>

      <LandingFooter />

      {/* Shared illustrated setup guide, opened from the API key section. */}
      <AiSetupModal />
    </div>
  )
}
