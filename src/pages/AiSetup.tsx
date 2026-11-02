import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { useAppStore } from '../store/useAppStore'
import { AiOnboarding } from '../components/AI/AiOnboarding'
import { AiDashboard } from '../components/AI/AiDashboard'
import { ModelManager } from '../components/AI/ModelManager'

/**
 * AI Setup.
 *
 * New learners see a guided onboarding experience. A saved key switches the
 * page to a compact dashboard. Both views use the same provider, verification
 * and model-management services.
 */
export default function AiSetup() {
  const navigate = useNavigate()
  const settings = useAppStore((s) => s.settings)
  const [onboarding, setOnboarding] = useState(() => !settings.ai?.apiKey)
  const [changing, setChanging] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const [managerTab, setManagerTab] = useState('models')

  const showOnboarding = onboarding || changing

  const openManager = (tab = 'models') => {
    setManagerTab(tab)
    setManagerOpen(true)
    window.setTimeout(() => {
      document.getElementById('model-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const startLearning = () => navigate('/learn')

  const later = () => {
    if (changing) {
      setChanging(false)
      return
    }
    navigate('/home')
  }

  const exploreModels = () => {
    setChanging(false)
    setOnboarding(false)
    openManager('models')
  }

  if (showOnboarding) {
    return (
      <AiOnboarding
        key={changing ? 'change' : 'setup'}
        mode={changing ? 'change' : 'setup'}
        onStartLearning={startLearning}
        onExploreModels={exploreModels}
        onLater={later}
      />
    )
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-3xl mx-auto space-y-5">
      <AiDashboard
        onOpenModels={() => openManager('models')}
        onChangeKey={() => setChanging(true)}
        onRemove={() => {
          setManagerOpen(false)
          setChanging(false)
          setOnboarding(true)
        }}
      />

      {managerOpen && (
        <div id="model-manager" className="scroll-mt-6 space-y-3">
          <ModelManager initialTab={managerTab} />
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setManagerOpen(false)}>
              <ChevronUp className="w-4 h-4" /> Hide Model Manager
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
