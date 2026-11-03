import React from 'react'
import { ClipboardCheck, HardDrive, Layers, Sparkles } from 'lucide-react'
import { Reveal, TextLink } from './shared'

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
    <section className="sf-section sf-statement" id="product" aria-labelledby="product-title">
      <div className="sf-container">
        <div className="sf-statement__head">
          <Reveal className="sf-statement__meta">
            <p className="sf-eyebrow">The whole learning loop</p>
            <span className="sf-statement__index">01 / SYSTEM</span>
          </Reveal>

          <Reveal className="sf-statement__title-wrap" delay={0.04}>
            <h2 className="sf-display sf-statement__title" id="product-title">
              Learning is a system.
              <span>Not a stack of tabs.</span>
            </h2>
          </Reveal>

          <Reveal className="sf-statement__aside" delay={0.08} y={18}>
            <p className="sf-lead">
              Studifree is not a pile of disconnected tools. It follows the natural rhythm of learning:
              understand an idea, remember it, test it, and see what to work on next.
            </p>
            <p className="sf-body">
              Start with an explanation or your own study material. Turn it into revision cards, practise
              with a quiz, and keep the lessons that matter in your library. The planner and progress view
              help you decide where the next session should go.
            </p>
            <TextLink href="#showcase">See the system in motion</TextLink>
          </Reveal>
        </div>

        <ol className="sf-statement__pillars">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <Reveal
                key={pillar.title}
                className="sf-statement__pillar"
                delay={0.05 * index}
                y={22}
              >
                <div className="sf-statement__pillar-top">
                  <span className="sf-statement__pillar-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="sf-statement__pillar-icon" aria-hidden="true">
                    <Icon width={16} height={16} />
                  </span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </Reveal>
            )
          })}
        </ol>

        <Reveal className="sf-statement__foot" y={10}>
          <span className="sf-statement__rule" aria-hidden="true" />
          <span>Seven focused tools · one calm workspace</span>
          <span className="sf-statement__foot-code">SF / LOOP / 2026</span>
        </Reveal>
      </div>
    </section>
  )
}
