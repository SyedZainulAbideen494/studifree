import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  FileText,
  Layers,
  Lightbulb,
  Clock,
  Library,
  ClipboardCheck,
  BarChart3,
  Calendar,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Faq } from '../components/About/Faq'

// Only genuine public profiles belong here. Empty until real ones are supplied.
const founderLinks: Array<{ label: string; href: string }> = []

const beliefs = [
  {
    icon: Users,
    title: 'Learning for everyone',
    body: 'Education and useful learning tools should be accessible, not reserved for those who can pay for them or already know where to look.',
  },
  {
    icon: Lightbulb,
    title: 'Understanding over memorisation',
    body: 'A correct answer is only useful if you know why it is correct. Studifree aims to explain the reasoning, not just hand over a result.',
  },
  {
    icon: Clock,
    title: 'Learn at your own pace',
    body: 'Every learner starts somewhere different. Learning should be flexible, patient and personal enough to fit the person doing it.',
  },
  {
    icon: Compass,
    title: 'Technology with purpose',
    body: 'AI should support understanding, not replace curiosity, effort or independent thinking. It is a tool for learning, never a shortcut past it.',
  },
]

const features = [
  {
    icon: BookOpen,
    title: 'AI Personal Teacher',
    body: 'Learn any topic with explanations, worked steps, examples and analogies written for your level.',
    to: '/learn',
    label: 'Open Learn',
  },
  {
    icon: Layers,
    title: 'Flashcards & spaced repetition',
    body: 'Build decks manually or generate them from a topic, then review at the right moment.',
    to: '/flashcards',
    label: 'Open Flashcards',
  },
  {
    icon: ClipboardCheck,
    title: 'Quiz Studio',
    body: 'Generate practice questions, take exam-style tests and review the explanations afterwards.',
    to: '/quiz',
    label: 'Open Quiz Studio',
  },
  {
    icon: FileText,
    title: 'AI-generated notes',
    body: 'Turn explanations into organised notes with key points, misconceptions and memory tricks, saved locally.',
    to: '/learn',
    label: 'Open Learn',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    body: 'Plan what to study and schedule reviews so your week has a clear, realistic shape.',
    to: '/planner',
    label: 'Open Planner',
  },
  {
    icon: Clock,
    title: 'Focus timer',
    body: 'Use a Pomodoro timer that keeps working while you switch tabs, so focus is easy to start.',
    to: '/planner',
    label: 'Open Focus timer',
  },
  {
    icon: BarChart3,
    title: 'Learning progress',
    body: 'See activity, quiz results and concept mastery so you know what to revisit next.',
    to: '/progress',
    label: 'View Progress',
  },
  {
    icon: Library,
    title: 'Personal Library',
    body: 'Keep lessons, decks and saved material together in one place that belongs to you.',
    to: '/library',
    label: 'Open Library',
  },
]

export default function About() {
  const reduced = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.hash !== '#faq') return
    const el = document.getElementById('faq')
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [location.hash])

  const fade = reduced
    ? {}
    : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } }

  return (
    <div className="px-5 pt-8 pb-16 max-w-4xl mx-auto">
      {/* Hero */}
      <header className="relative">
        <motion.p
          {...fade}
          transition={{ duration: 0.5 }}
          className="text-[11px] uppercase tracking-[0.18em] text-faint"
        >
          About Studifree
        </motion.p>
        <motion.h1
          {...fade}
          transition={{ duration: 0.55, delay: reduced ? 0 : 0.05 }}
          className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold text-ink tracking-[-0.03em] leading-[1.04]"
        >
          Learning should be
          <br />
          for everyone.
        </motion.h1>
        <motion.p
          {...fade}
          transition={{ duration: 0.55, delay: reduced ? 0 : 0.12 }}
          className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-2xl"
        >
          Studifree is built around a simple idea: understanding something should never feel out of reach. Whether
          you&apos;re learning your first concept, preparing for an important examination or exploring something
          entirely new, you deserve tools that make learning clearer, simpler and more accessible.
        </motion.p>

        {/* Monochrome visual composition — no stock imagery */}
        <motion.div
          {...fade}
          transition={{ duration: 0.7, delay: reduced ? 0 : 0.18 }}
          className="relative mt-9 h-52 sm:h-64 rounded-[2rem] border border-line bg-surface overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 55%, var(--color-accent-soft), transparent 62%)',
            }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[1, 2, 3, 4].map((ring) => (
              <div
                key={ring}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
                style={{ width: `${ring * 92}px`, height: `${ring * 92}px` }}
              />
            ))}
            <div className="relative w-28 h-28 rounded-full glass border border-line-strong flex items-center justify-center animate-float">
              <div className="text-center">
                <Sparkles className="w-4 h-4 text-ink mx-auto mb-1" />
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted">Studifree</p>
              </div>
            </div>
          </div>
          {[
            { label: 'Understand', className: 'left-[8%] top-[22%]' },
            { label: 'Practise', className: 'right-[8%] top-[38%]' },
            { label: 'Remember', className: 'left-[16%] bottom-[18%]' },
          ].map((tag) => (
            <span
              key={tag.label}
              className={`absolute ${tag.className} px-2.5 py-1 rounded-full bg-surface/80 border border-line text-[10px] tracking-wide text-muted backdrop-blur`}
            >
              {tag.label}
            </span>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        </motion.div>
      </header>

      {/* Founder identity */}
      <motion.section
        {...fade}
        transition={{ duration: 0.55 }}
        className="mt-16 sm:mt-24 border-t border-line pt-10 sm:pt-14"
        aria-labelledby="founder-heading"
      >
        <div className="grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] gap-8 md:gap-12">
          <div className="md:sticky md:top-24 self-start">
            <div className="relative rounded-[2rem] border border-line-strong bg-surface overflow-hidden p-6 sm:p-7">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 20%, var(--color-accent-soft), transparent 65%)',
                }}
              />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.22em] text-faint">Founder</p>
                <p
                  className="mt-5 text-5xl sm:text-6xl font-semibold tracking-[-0.06em] text-ink leading-none"
                  aria-hidden="true"
                >
                  SZA
                </p>
                <div className="h-px w-12 bg-line-strong mt-5" />
                <p className="mt-4 text-base font-medium text-ink">Syed Zainul Abideen</p>
                <p className="text-sm text-muted mt-0.5">Founder of Studifree</p>
                <p className="text-xs text-faint mt-5 leading-relaxed">
                  An independent, learner-led project. No invented team page, no borrowed credentials —
                  just the person building it.
                </p>
                {founderLinks.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {founderLinks.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs text-muted hover:text-ink inline-flex items-center gap-1"
                        >
                          {link.label} <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">The founder</p>
            <h2
              id="founder-heading"
              className="text-3xl sm:text-4xl font-semibold text-ink tracking-[-0.03em] leading-[1.08]"
            >
              An idea built by a learner.
            </h2>

            <div className="space-y-4 text-muted leading-relaxed mt-6">
              <p>
                Studifree was founded by Syed Zainul Abideen with a simple belief: useful learning tools
                should be accessible to everyone.
              </p>
              <p>
                The idea came from wanting a more organised and approachable way to learn — a place where
                people could understand difficult concepts, create study resources, practise and take
                control of their own learning.
              </p>
              <p>
                What started as an idea grew into an attempt to bring those experiences together in one
                platform.
              </p>
              <p>
                Studifree is independently built and continues to evolve with the goal of making learning
                simpler, more accessible and more personal.
              </p>
            </div>

            <p className="mt-6 text-sm text-ink border-l-2 border-line-strong pl-4">
              Studifree is an independent project founded by Syed Zainul Abideen.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Why I made Studifree */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20" aria-labelledby="why-heading">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">The reason</p>
        <h2 id="why-heading" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
          Why I made Studifree
        </h2>

        <div className="mt-7 grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-7 md:gap-10">
          <div className="md:sticky md:top-24 self-start">
            <p className="text-2xl sm:text-[28px] font-medium text-ink leading-snug tracking-tight">
              “I wanted learning to feel simpler.”
            </p>
            <div className="h-px w-12 bg-line-strong mt-5" />
            <p className="text-xs text-faint mt-4">A note from the creator</p>
          </div>

          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              I created Studifree because I wanted learning to feel simpler. I believe that everyone should have
              access to tools that help them understand, practise and improve, regardless of what they study or
              where they come from.
            </p>
            <p>
              Learning can sometimes feel overwhelming. There is so much information available, yet finding a way
              to understand it, organise it and remember it can be difficult. I wanted to bring those parts
              together into one place.
            </p>
            <p>
              A place where you can learn at your own pace, ask questions without hesitation, turn your material
              into useful study resources and gradually see yourself improve. Studifree is my attempt to make that
              experience more accessible.
            </p>
            <p>
              It is not about replacing teachers, classrooms or independent thinking. It is about giving learners
              another tool to explore ideas, build confidence and take control of their learning.
            </p>
            <p className="text-ink">
              I want Studifree to remain simple, useful and welcoming to anyone who wants to learn something new.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Beliefs */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20" aria-labelledby="beliefs-heading">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">What we believe</p>
        <h2 id="beliefs-heading" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
          What Studifree believes in
        </h2>

        <div className="mt-7 grid sm:grid-cols-2 gap-3">
          {beliefs.map((b, i) => (
            <div
              key={b.title}
              className="group rounded-3xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
            >
              <div className="w-10 h-10 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-ink" />
              </div>
              <h3 className="text-sm font-semibold text-ink">
                <span className="text-faint tabular-nums mr-1.5">0{i + 1}</span>
                {b.title}
              </h3>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20" aria-labelledby="features-heading">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">Inside the app</p>
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
          What you can do with Studifree
        </h2>
        <p className="text-muted mt-2 max-w-xl">
          Every feature below is available in the application today.
        </p>

        <div className="mt-7 grid sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group rounded-3xl border border-line bg-surface p-5 transition-all duration-300 hover:border-line-strong hover:bg-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-ink" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-faint transition group-hover:text-ink" />
              </div>
              <h3 className="text-sm font-semibold text-ink mt-3">{f.title}</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">{f.body}</p>
              <span className="text-[11px] text-muted mt-3 inline-flex items-center gap-1 group-hover:text-ink">
                {f.label} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* AI approach */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20" aria-labelledby="ai-approach-heading">
        <div className="rounded-[2rem] glass border border-line-strong p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">Honest by default</p>
          <h2 id="ai-approach-heading" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Our approach to AI
          </h2>
          <div className="mt-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted leading-relaxed">
            <p>
              <span className="text-ink font-medium">AI is a learning assistant.</span> It can simplify complex
              material, suggest examples and help create study resources when you ask for them.
            </p>
            <p>
              <span className="text-ink font-medium">It can make mistakes.</span> Always verify important facts,
              calculations and examination-related information against reliable sources.
            </p>
            <p>
              <span className="text-ink font-medium">You choose the provider.</span> Studifree currently connects to
              Google Gemini using your own API key, configured in AI Setup.
            </p>
            <p>
              <span className="text-ink font-medium">Costs and limits are Google&apos;s.</span> AI usage may have
              third-party quotas or charges. Manual learning tools remain available without a key.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Free to start */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20" aria-labelledby="free-heading">
        <div className="grid md:grid-cols-2 gap-7 items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">Free to start</p>
            <h2 id="free-heading" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              No account just to begin.
            </h2>
            <p className="text-muted mt-3 leading-relaxed">
              Studifree is designed to make useful learning tools accessible without requiring everyone to create
              an account just to get started.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'No mandatory login for core local functionality.',
              'Local-first: your study data lives in this browser.',
              'Manual study features work without an AI key.',
              'AI features require a supported provider and your own API key.',
              'Third-party AI usage may have separate pricing and limits.',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5 text-sm text-muted">
                <span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-ink" />
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Closing */}
      <motion.section {...fade} transition={{ duration: 0.5 }} className="mt-16 sm:mt-20">
        <div className="relative rounded-[2rem] border border-line-strong bg-surface overflow-hidden p-7 sm:p-10 text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 0%, var(--color-accent-soft), transparent 60%)' }}
          />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint mb-3">A message from the creator</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight max-w-xl mx-auto">
              There&apos;s always something new to learn.
            </h2>
            <p className="text-muted mt-4 max-w-xl mx-auto leading-relaxed">
              Studifree is an evolving project, and I want it to keep growing with the people who use it. Every
              improvement should make learning a little clearer, a little more organised and a little more
              accessible.
            </p>
            <p className="text-ink mt-6 font-medium">
              Thank you for being here. And more importantly, thank you for learning.
            </p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Start learning <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <div className="mt-16 sm:mt-24">
        <Faq />
      </div>
    </div>
  )
}
