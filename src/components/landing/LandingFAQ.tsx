import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HelpCircle, Plus, Sparkles } from 'lucide-react'
import {
  landingFaqCategories,
  landingFaqItems,
  type LandingFaqCategoryId,
} from '../../data/landing'
import { LandingLink, Reveal, SectionHead, TextLink, cx } from './shared'

type Filter = 'all' | LandingFaqCategoryId

const featured = landingFaqItems.find((item) => item.id === 'why-own-key') ?? landingFaqItems[0]

export function LandingFAQ() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>('how-does-it-work')
  const reduced = useReducedMotion()

  const filtered =
    filter === 'all'
      ? landingFaqItems
      : landingFaqItems.filter((item) => item.category === filter)

  const activeCategory = landingFaqCategories.find((category) => category.id === filter)

  const chooseFilter = (next: Filter) => {
    setFilter(next)
    setOpenId(null)
  }

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section className="sf-section" id="faq" aria-labelledby="faq-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="Frequently asked"
            title={<span id="faq-title">Questions, answered plainly.</span>}
            description="Everything from how the app works to where your data goes. If something is still unclear, the Help Centre goes further."
          />
        </Reveal>

        <div className="sf-faq__layout">
          <Reveal className="sf-faq__aside">
            <div className="sf-glass sf-faq__featured">
              <span className="sf-faq__featured-label">
                <Sparkles width={12} height={12} aria-hidden="true" /> Start here
              </span>
              <h3>{featured.question}</h3>
              <p>{featured.answer}</p>
              <div style={{ marginTop: 16 }}>
                <TextLink href="#api-keys">See the setup guide</TextLink>
              </div>
            </div>

            <div className="sf-glass sf-glass--flat" style={{ padding: 20, borderRadius: 20 }}>
              <p className="sf-faq__featured-label">
                <HelpCircle width={12} height={12} aria-hidden="true" /> Still curious?
              </p>
              <p className="sf-faq__category-description" style={{ marginTop: 10 }}>
                The Help Centre covers the tools one by one and explains what is stored locally and what is
                sent externally.
              </p>
              <div style={{ marginTop: 14 }}>
                <TextLink href="/help">Visit the Help Centre</TextLink>
              </div>
            </div>
          </Reveal>

          <div>
            <div className="sf-faq__filters" role="group" aria-label="Filter questions by topic">
              <button
                type="button"
                className="sf-faq__filter"
                aria-pressed={filter === 'all'}
                onClick={() => chooseFilter('all')}
              >
                All questions
              </button>
              {landingFaqCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="sf-faq__filter"
                  aria-pressed={filter === category.id}
                  onClick={() => chooseFilter(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <p
              className="sf-faq__category-description"
              style={{ marginTop: 14 }}
              aria-live="polite"
            >
              {activeCategory?.description ?? 'All questions, grouped by topic.'}
            </p>

            <div className="sf-faq__list" style={{ marginTop: 16 }}>
              {filtered.map((item, index) => {
                const isOpen = openId === item.id
                return (
                  <div className="sf-faq__item" key={item.id}>
                    <h3 style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="sf-faq__trigger"
                        id={`faq-trigger-${item.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${item.id}`}
                        onClick={() => toggle(item.id)}
                      >
                        <span className="sf-faq__number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="sf-faq__question">{item.question}</span>
                        <span className="sf-faq__icon" aria-hidden="true">
                          <Plus width={13} height={13} />
                        </span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${item.id}`}
                          className="sf-faq__answer-wrap"
                          initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                          exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{
                            duration: reduced ? 0 : 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <p className="sf-faq__answer">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            <div className={cx('sf-faq__more')}>
              <p className="sf-small" style={{ marginBottom: 12 }}>
                Showing {filtered.length} of {landingFaqItems.length} questions.
              </p>
              <LandingLink href="/help" variant="secondary" showArrow>
                Open the Help Centre
              </LandingLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
