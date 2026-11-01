import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, HelpCircle, Plus, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../UI/Button'
import {
  faqCategories,
  faqItems,
  filterFaq,
  type FaqCategoryId,
} from '../../data/faq'

/** Turn bare URLs in editable answers into safe external links. */
function renderAnswer(answer: string): React.ReactNode {
  const parts = answer.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, index) => {
    if (!/^https?:\/\//.test(part)) return <React.Fragment key={index}>{part}</React.Fragment>
    const trailing = part.match(/[.,;:)]+$/)?.[0] ?? ''
    const url = trailing ? part.slice(0, -trailing.length) : part
    return (
      <React.Fragment key={index}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-ink underline underline-offset-2 break-all"
        >
          {url}
        </a>
        {trailing}
      </React.Fragment>
    )
  })
}

export const Faq: React.FC = () => {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [category, setCategory] = useState<FaqCategoryId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => filterFaq(faqItems, category, query), [category, query])

  useEffect(() => {
    if (openId && !filtered.some((item) => item.id === openId)) setOpenId(null)
  }, [filtered, openId])

  const activeCategory = faqCategories.find((c) => c.id === category)

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">Frequently asked</p>
        <h2 id="faq-heading" className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight leading-[1.1]">
          A few things you might be wondering.
        </h2>
        <p className="text-muted mt-3 leading-relaxed">
          Everything you need to know before getting started.
        </p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[290px_minmax(0,1fr)] gap-5 items-start">
        {/* Featured panel + categories */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="glass rounded-3xl border border-line-strong shadow-card p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-faint">Browse</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-semibold text-ink leading-none tabular-nums">
                {filtered.length}
              </span>
              <span className="text-xs text-muted pb-1">
                {filtered.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
            <p className="text-sm text-ink mt-3">
              {activeCategory ? activeCategory.label : 'All questions'}
            </p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {activeCategory
                ? activeCategory.description
                : 'Search and browse every question about Studifree in one place.'}
            </p>

            <div className="mt-4 pt-4 border-t border-line">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1">
                <button
                  onClick={() => setCategory('all')}
                  aria-pressed={category === 'all'}
                  className={`whitespace-nowrap text-left px-3 py-2 rounded-xl text-xs transition ${
                    category === 'all'
                      ? 'bg-accent text-accent-ink'
                      : 'text-muted hover:text-ink hover:bg-accent-soft'
                  }`}
                >
                  All questions
                </button>
                {faqCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    aria-pressed={category === c.id}
                    className={`whitespace-nowrap text-left px-3 py-2 rounded-xl text-xs transition ${
                      category === c.id
                        ? 'bg-accent text-accent-ink'
                        : 'text-muted hover:text-ink hover:bg-accent-soft'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5">
            <HelpCircle className="w-5 h-5 text-ink mb-2" />
            <p className="text-sm font-medium text-ink">Still have questions?</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              The Help Centre has step-by-step guides for AI setup, storage, imports and troubleshooting.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => navigate('/help')}
            >
              Open Help Centre <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </aside>

        {/* Search + accordion */}
        <div>
          <div className="relative">
            <Search className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search frequently asked questions"
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-surface border border-line text-sm text-ink placeholder:text-faint focus:outline-none focus:border-line-strong"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-faint hover:text-ink hover:bg-accent-soft"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-line bg-surface p-8 text-center">
              <p className="text-sm font-medium text-ink">No questions match that search.</p>
              <p className="text-xs text-muted mt-1">Try fewer words or choose another category.</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-line bg-surface overflow-hidden">
              {filtered.map((item, index) => {
                const isOpen = openId === item.id
                return (
                  <div
                    key={item.id}
                    className={`transition-colors ${isOpen ? 'bg-accent-soft' : 'hover:bg-elevated'} ${
                      index === 0 ? '' : 'border-t border-line'
                    }`}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      className="w-full flex items-start gap-3 sm:gap-4 text-left px-4 sm:px-5 py-4"
                    >
                      <span className="text-[11px] text-faint tabular-nums pt-1 w-6 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`flex-1 text-sm sm:text-[15px] leading-relaxed transition-colors ${
                          isOpen ? 'text-ink font-medium' : 'text-ink'
                        }`}
                      >
                        {item.question}
                      </span>
                      <Plus
                        className={`w-4 h-4 shrink-0 mt-1 transition-transform duration-300 ${
                          isOpen ? 'rotate-45 text-ink' : 'text-faint'
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${item.id}`}
                          role="region"
                          aria-label={item.question}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                          }
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 pl-[52px] sm:pl-[60px] text-sm text-muted leading-relaxed">
                            {renderAnswer(item.answer)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-[11px] text-faint mt-3">
            {filtered.length} of {faqItems.length} questions shown
            {category !== 'all' ? ` · ${activeCategory?.label}` : ''}
          </p>
        </div>
      </div>
    </section>
  )
}
