import React, { useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Cloud,
  Database,
  HardDrive,
  KeyRound,
  Layers,
  Network,
  Sparkles,
} from 'lucide-react'
import {
  beginnerSteps,
  comparisonRows,
  externalServices,
  storageBuckets,
  techNodes,
  youtubeTutorialSearch,
} from '../../data/landing'
import { LandingLink, Reveal, SectionHead, TextLink, cx } from './shared'

const techIcons = {
  application: Layers,
  storage: Database,
  key: KeyRound,
  provider: Cloud,
  response: Sparkles,
} as const

const bucketIcons = {
  indexeddb: Database,
  localstorage: HardDrive,
  external: Cloud,
} as const

const invariants = [
  { code: '01', label: 'Browser application', value: 'React + TypeScript' },
  { code: '02', label: 'Local study data', value: 'IndexedDB · LocalStorage' },
  { code: '03', label: 'AI connection', value: 'Optional · your key' },
]

const aiFlow = [
  {
    title: 'You ask in Studifree',
    body: 'A question, a topic or your own source material starts the request.',
    tag: 'On your device',
  },
  {
    title: 'The request is prepared',
    body: 'Only the prompt and the material needed for that request are included.',
    tag: 'In your browser',
  },
  {
    title: 'Your key authenticates it',
    body: 'The request is sent to Google Gemini using your own AI Studio project key.',
    tag: 'To provider',
  },
  {
    title: 'Gemini processes it',
    body: 'Google returns an explanation, notes, flashcards or quiz questions.',
    tag: 'Provider',
  },
  {
    title: 'You decide what to keep',
    body: 'Save the result to your local library or discard it. Nothing is published automatically.',
    tag: 'Back on device',
  },
]

/**
 * The technical chapter. Architecture, storage, the optional AI flow and the
 * external services are all exposed as inspectable panels, not marketing copy.
 */
export function TechnologySection() {
  const [selectedNode, setSelectedNode] = useState(techNodes[0].id)
  const [selectedBucket, setSelectedBucket] = useState<string>(storageBuckets[0].id)

  const node = techNodes.find((item) => item.id === selectedNode) ?? techNodes[0]
  const bucket = storageBuckets.find((item) => item.id === selectedBucket) ?? storageBuckets[0]
  const BucketIcon = bucketIcons[bucket.id as keyof typeof bucketIcons] ?? Database

  return (
    <section className="sf-section sf-tech" id="technology" aria-labelledby="technology-title">
      <div className="sf-container">
        <div className="sf-tech__head">
          <Reveal>
            <SectionHead
              eyebrow="Under the hood"
              meta="07 / SYSTEM"
              title={<span id="technology-title">Less dependency. More control.</span>}
              description="Studifree is a browser application with local storage at its centre and AI as an optional extension. Here is how the pieces fit together, in plain language."
            />
          </Reveal>

          <Reveal className="sf-tech__aside" delay={0.08} y={16}>
            <ul>
              {invariants.map((item) => (
                <li key={item.code}>
                  <span aria-hidden="true">{item.code}</span>
                  <strong>{item.label}</strong>
                  <em>{item.value}</em>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="sf-arch">
          <div className="sf-arch__flow">
            <span className="sf-arch__spine" aria-hidden="true" />
            <span className="sf-arch__particle" aria-hidden="true" />
            <span className="sf-arch__particle sf-arch__particle--2" aria-hidden="true" />

            {techNodes.map((item) => {
              const Icon = techIcons[item.id as keyof typeof techIcons] ?? Layers
              const optional = item.id === 'key' || item.id === 'provider'
              return (
                <button
                  key={item.id}
                  type="button"
                  className="sf-arch__node"
                  aria-pressed={selectedNode === item.id}
                  onClick={() => setSelectedNode(item.id)}
                >
                  <span className="sf-arch__node-icon" aria-hidden="true">
                    <Icon width={17} height={17} />
                  </span>
                  <span className="sf-arch__node-text">
                    <strong>{item.label}</strong>
                    <span>{item.short}</span>
                  </span>
                  {optional ? (
                    <span className="sf-arch__optional">Optional</span>
                  ) : (
                    <ChevronRight className="sf-arch__node-arrow" width={15} height={15} aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="sf-arch__detail" aria-live="polite">
            <div className="sf-arch__detail-label">
              <Network width={13} height={13} aria-hidden="true" />
              {node.short}
            </div>
            <h3>{node.label}</h3>
            <p>{node.description}</p>
            <p>{node.detail}</p>
            <p className="sf-arch__caption">
              Select a step in the diagram to read what happens there. This is a simplified view, not a
              complete technical specification.
            </p>
          </div>
        </div>

        <div className="sf-data">
          <Reveal className="sf-data__copy">
            <p className="sf-eyebrow">Data ownership</p>
            <h3 className="sf-h3">Your study data stays on your device.</h3>
            <p className="sf-body">
              Supported study material is stored in this browser using IndexedDB and LocalStorage. There is no
              automatic cloud sync, so the data does not follow you to another device on its own.
            </p>
            <p className="sf-body">
              Local storage is convenient, but it is tied to this browser profile. Clearing site data can
              remove it, and anyone with access to the profile may be able to read it. Export supported study
              data if you need a backup.
            </p>
            <div className="sf-actions">
              <TextLink href="/help">How data is handled</TextLink>
              <TextLink href="/settings">Manage local data</TextLink>
            </div>
          </Reveal>

          <Reveal className="sf-data__device" delay={0.08} y={18}>
            <div className="sf-data__device-bar">
              <span>This browser</span>
              <span className="sf-pill">Data map</span>
            </div>

            <div className="sf-data__tabs">
              {storageBuckets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="sf-data__tab"
                  aria-pressed={selectedBucket === item.id}
                  onClick={() => setSelectedBucket(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <p className="sf-data__bucket-title">
                <BucketIcon width={15} height={15} aria-hidden="true" />
                {bucket.label}
                <span className="sf-pill">{bucket.badge}</span>
              </p>
              <p className="sf-data__bucket-copy">{bucket.summary}</p>
              <ul className="sf-data__items">
                {(bucket.items as readonly string[]).map((item) => (
                  <li key={item}>
                    <Check aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="sf-data__warning">
                <AlertTriangle aria-hidden="true" />
                <span>
                  {bucket.id === 'external'
                    ? 'These requests happen only for the purposes shown. Opening the app alone does not upload your study library.'
                    : 'Browser storage is not automatically encrypted. Protect your device and browser profile, and keep a backup of anything important.'}
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="sf-aiflow" y={18}>
          <div className="sf-aiflow__head">
            <p className="sf-eyebrow">BYOK AI flow</p>
            <h3 className="sf-h3">What happens when you use AI.</h3>
          </div>
          {aiFlow.map((step, index) => (
            <div className="sf-aiflow__step" key={step.title}>
              <span className="sf-aiflow__num">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
              <span className="sf-aiflow__tag">{step.tag}</span>
            </div>
          ))}
        </Reveal>

        <Reveal className="sf-tech__subhead">
          <SectionHead
            eyebrow="A fair comparison"
            title="Different models, different trade-offs."
            description="Subscription platforms bundle AI into a plan. Studifree keeps the core local tools separate and connects AI through your own provider key. Neither approach is automatically better for every learner."
          />
        </Reveal>

        <div className="sf-compare" role="table" aria-label="Comparison of subscription platforms and Studifree">
          <div className="sf-compare__row sf-compare__row--head" role="row">
            <div className="sf-compare__cell" role="columnheader">
              Area
            </div>
            <div className="sf-compare__cell" role="columnheader">
              Subscription platforms
            </div>
            <div className="sf-compare__cell" role="columnheader">
              Studifree
            </div>
          </div>
          {comparisonRows.map((row) => (
            <div className="sf-compare__row" role="row" key={row.area}>
              <div className="sf-compare__cell" role="cell">
                <strong>{row.area}</strong>
              </div>
              <div className="sf-compare__cell" role="cell" data-label="Subscription platforms">
                {row.traditional}
              </div>
              <div className="sf-compare__cell" role="cell" data-label="Studifree">
                {row.studifree}
              </div>
            </div>
          ))}
        </div>
        <p className="sf-compare__note">
          Platform features and pricing change. These rows describe the general model, not a claim about a
          specific competitor’s current plan. Check each service’s own documentation before choosing.
        </p>

        <Reveal className="sf-tech__subhead sf-tech__subhead--tight" y={16}>
          <h3 className="sf-h3">Services outside your browser.</h3>
          <p className="sf-body">
            Studifree is not a no-server application. These services are used for specific, disclosed
            purposes only.
          </p>
        </Reveal>

        <div className="sf-services">
          <div className="sf-services__row sf-services__row--head">
            <div className="sf-services__cell">Service</div>
            <div className="sf-services__cell">Why it is used</div>
            <div className="sf-services__cell">What is involved</div>
          </div>
          {externalServices.map((service) => (
            <div className="sf-services__row" key={service.name}>
              <div className="sf-services__cell" data-label="Service">
                <strong>{service.name}</strong>
              </div>
              <div className="sf-services__cell" data-label="Why it is used">
                {service.purpose}
              </div>
              <div className="sf-services__cell" data-label="What is involved">
                {service.data}
              </div>
            </div>
          ))}
        </div>

        <div className="sf-beginner">
          <Reveal className="sf-beginner__copy">
            <p className="sf-eyebrow">New to all of this?</p>
            <h3 className="sf-h3">Start local. Add AI when it helps.</h3>
            <p className="sf-body">
              You can use manual flashcards, the planner and your local library without touching an API key.
              When you are ready for AI, the setup is a short browser task. The steps on the right are the
              whole process.
            </p>
            <div className="sf-beginner__video">
              <h4>Prefer to watch someone do it?</h4>
              <p>
                Search YouTube for a current beginner walkthrough of Google AI Studio. Third-party videos are
                not maintained by Studifree, so follow the official AI Studio labels and Google’s current
                documentation.
              </p>
              <LandingLink href={youtubeTutorialSearch} variant="secondary" showArrow>
                Search on YouTube
              </LandingLink>
            </div>
          </Reveal>

          <Reveal className="sf-beginner__steps" delay={0.08} y={18}>
            {beginnerSteps.map((step, index) => (
              <div className="sf-beginner__step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal className={cx('sf-actions', 'sf-tech__actions')} y={10}>
          <LandingLink href="/ai-setup" variant="secondary" showArrow>
            Open AI Setup
          </LandingLink>
          <LandingLink href="/help" variant="ghost" showArrow>
            Get help
          </LandingLink>
        </Reveal>
      </div>
    </section>
  )
}
