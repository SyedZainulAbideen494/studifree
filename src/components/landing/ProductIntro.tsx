import React from 'react'
import { ClipboardCheck, HardDrive, Layers, Sparkles } from 'lucide-react'
import { Reveal, SectionHead, TextLink } from './shared'

const pillars = [
  {
    icon: Sparkles,
    title: 'Understand',
    body: 'Ask a question and get a patient, beginner-friendly explanation you can follow up on.',
  },
  {
    icon: Layers,
    title: 'Remember',
    body: 'Turn a topic into flashcards and review with active recall and spaced repetition.',
  },
  {
    icon: ClipboardCheck,
    title: 'Apply',
    body: 'Test yourself with quizzes, then review results and the concepts that need attention.',
  },
  {
    icon: HardDrive,
    title: 'Own',
    body: 'Keep supported study data in your browser. Bring your own AI key when you want AI.',
  },
]

export function ProductIntro() {
  return (
    <section className="sf-section" id="product" aria-labelledby="product-title">
      <div className="sf-container">
        <div className="sf-intro">
          <Reveal className="sf-intro__copy">
            <SectionHead
              eyebrow="The whole learning loop"
              title={
                <span id="product-title">
                  One space for the whole way you learn.
                </span>
              }
              description="Studifree is not a pile of disconnected tools. It follows the natural rhythm of learning: understand an idea, remember it, test it, and see what to work on next."
            />
            <p className="sf-body">
              Start with an explanation or your own study material. Turn it into revision cards, practise
              with a quiz, and keep the lessons that matter in your library. The planner and progress view
              help you decide where the next session should go.
            </p>
            <div className="sf-actions">
              <TextLink href="#features">See everything inside</TextLink>
            </div>
          </Reveal>

          <div className="sf-intro__aside">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon
              return (
                <Reveal
                  key={pillar.title}
                  className="sf-glass sf-glass--flat sf-intro__aside-item"
                  delay={0.06 * index}
                  y={18}
                >
                  <Icon aria-hidden="true" />
                  <p>
                    <strong>{pillar.title}</strong>
                    {pillar.body}
                  </p>
                </Reveal>
              )
            })}
          </div>
        </div>

        <Reveal className="sf-intro__transition" y={10}>
          Seven focused tools · one calm workspace
        </Reveal>
      </div>
    </section>
  )
}
