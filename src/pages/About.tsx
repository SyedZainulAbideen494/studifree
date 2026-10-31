import React from 'react'
import { MatrixRain } from '../components/Effects/MatrixRain'
import { Card } from '../components/UI/Card'

export default function About() {
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <div className="relative h-48 rounded-3xl overflow-hidden border border-line">
        <MatrixRain opacity={0.4} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-semibold text-ink">Studifree</h1>
        </div>
      </div>
      <Card>
        <h2 className="font-semibold text-ink mb-2">What is Studifree?</h2>
        <p className="text-muted leading-relaxed">Studifree is a free learning platform designed to make learning simple, accessible and free for everyone. Learn topics, upload materials, create flashcards and quizzes, and track progress. No account required.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Why it was created</h2>
        <p className="text-muted leading-relaxed">To remove barriers to learning: cost, complexity and intimidation. Learning should be for everyone.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Learning philosophy</h2>
        <p className="text-muted leading-relaxed">Understanding over memorisation. One concept at a time. Adaptive support based on evidence, not guesses.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">How AI works</h2>
        <p className="text-muted leading-relaxed">You provide an API key. Studifree sends your prompts to the provider you choose. AI output may be inaccurate; verify important facts.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Free and third-party charges</h2>
        <p className="text-muted leading-relaxed">Studifree core features are free. AI providers may charge or impose quotas. Manual tools work without AI.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Privacy and storage</h2>
        <p className="text-muted leading-relaxed">Data stays on your device. You can export and delete it anytime.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Limitations</h2>
        <p className="text-muted leading-relaxed">AI can be wrong. Simulations are simplified models. Not affiliated with any exam board.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Design inspiration</h2>
        <p className="text-muted leading-relaxed text-sm">Some visual effects are inspired by community components (Uiverse.io) and reimplemented in monochrome. Attribution retained where required.</p>
      </Card>
      <Card>
        <h2 className="font-semibold text-ink mb-2">Get help</h2>
        <p className="text-muted leading-relaxed">Visit the Help Centre for guides and troubleshooting.</p>
      </Card>
    </div>
  )
}
