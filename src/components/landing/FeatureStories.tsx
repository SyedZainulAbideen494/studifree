import React from 'react'
import { Check } from 'lucide-react'
import { featureStories } from '../../data/landing'
import { LandingLink, Reveal, SectionHead, cx } from './shared'
import {
  FlashcardPreview,
  LessonPreview,
  LibraryPreview,
  NotesPreview,
  PlannerPreview,
  ProgressPreview,
  QuizPreview,
  WindowChrome,
} from './ProductPreviews'

function FeatureVisual({ id }: { id: string }) {
  switch (id) {
    case 'feature-ai-teacher':
      return (
        <WindowChrome title="Learn · AI teacher">
          <LessonPreview />
        </WindowChrome>
      )
    case 'feature-flashcards':
      return <FlashcardPreview />
    case 'feature-quiz':
      return (
        <WindowChrome title="Quiz Studio · Practice">
          <QuizPreview />
        </WindowChrome>
      )
    case 'feature-notes':
      return <NotesPreview />
    case 'feature-planner':
      return (
        <WindowChrome title="Planner · Today">
          <PlannerPreview />
        </WindowChrome>
      )
    case 'feature-progress':
      return (
        <WindowChrome title="Progress · This week" roomy>
          <ProgressPreview />
        </WindowChrome>
      )
    case 'feature-library':
      return (
        <WindowChrome title="Library · Saved" roomy>
          <LibraryPreview />
        </WindowChrome>
      )
    default:
      return null
  }
}

export function FeatureStories() {
  return (
    <section className="sf-section" id="features" aria-labelledby="features-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="Inside Studifree"
            title={<span id="features-title">Seven ways to make learning stick.</span>}
            description="Each tool is designed for a specific part of learning. Use them together, or start with the one that fits the way you study today."
          />
        </Reveal>

        <div style={{ marginTop: 'clamp(36px, 5vw, 64px)' }}>
          {featureStories.map((story, index) => {
            const reverse = index % 2 === 1
            return (
              <article
                key={story.id}
                id={story.id}
                className={cx('sf-feature', reverse && 'sf-feature--reverse')}
                aria-labelledby={`${story.id}-title`}
              >
                <Reveal className="sf-feature__copy" y={22}>
                  <div className="sf-feature__index">
                    <span>{story.index}</span>
                    <span aria-hidden="true" />
                  </div>

                  <span className="sf-pill">{story.label}</span>

                  <h3 className="sf-h3" id={`${story.id}-title`}>
                    {story.title}
                  </h3>

                  <p className="sf-body">{story.description}</p>

                  <ul className="sf-feature__points">
                    {story.points.map((point) => (
                      <li key={point}>
                        <Check aria-hidden="true" strokeWidth={2.2} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="sf-actions">
                    <LandingLink href={story.to} variant="secondary" showArrow>
                      {story.cta}
                    </LandingLink>
                  </div>
                </Reveal>

                <Reveal className="sf-feature__visual" delay={0.08} y={20}>
                  <div className="sf-preview sf-glass">
                    <div className="sf-preview__canvas">
                      <FeatureVisual id={story.id} />
                    </div>
                    <div className="sf-preview__caption">
                      <span>Illustrative preview</span>
                      <span>{story.label}</span>
                    </div>
                  </div>
                </Reveal>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
