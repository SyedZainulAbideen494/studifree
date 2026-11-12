import { aiLinks } from './aiLinks'

/* -------------------------------------------------------------------------- */
/* Navigation and hero                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The floating dock is icon-only, so each item carries the icon key, the
 * accessible label and the tooltip copy separately from the anchor target.
 * `accent` only tints the active pill and tooltip dot very slightly.
 */
export interface LandingNavItem {
  id: 'home' | 'features' | 'how-it-works' | 'about' | 'faq'
  label: string
  href: string
  accent: 'blue' | 'violet' | 'orange' | 'red'
}

export const landingNavItems: LandingNavItem[] = [
  { id: 'home', label: 'Home', href: '#top', accent: 'blue' },
  { id: 'features', label: 'Features', href: '#features', accent: 'violet' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works', accent: 'orange' },
  { id: 'about', label: 'About Studifree', href: '#why-free', accent: 'red' },
  { id: 'faq', label: 'Help & FAQ', href: '#faq', accent: 'blue' },
]

export interface HeroStat {
  value: string
  label: string
  className: string
}

export const heroCopy = {
  eyebrow: 'Studifree — the learning operating system',
  titleLines: ['LEARN', 'DIFFERENTLY.'],
  description:
    'One focused space where difficult topics become clear, your notes become memory, and every session moves you forward.',
  primaryCta: 'Start learning free',
  secondaryCta: 'See how it works',
  status: 'SYSTEM ONLINE',
  coordinates: 'SF — 01 / 2026',
  note: 'No subscription wall · Your own AI key · Local-first by design',
  stats: [
    { value: '+∞', label: 'Ways to learn', className: 'sf-hero__stat--a' },
    { value: 'AI', label: 'Optional intelligence', className: 'sf-hero__stat--b' },
    { value: 'LOCAL', label: 'Your study space', className: 'sf-hero__stat--c' },
    { value: 'FREE', label: 'No subscription wall', className: 'sf-hero__stat--d' },
  ] satisfies HeroStat[],
}

/* -------------------------------------------------------------------------- */
/* Statement                                                                  */
/* -------------------------------------------------------------------------- */

export const statementCopy = {
  eyebrow: '01 / The problem',
  title: 'Studying was never supposed to feel this hard.',
  support:
    'Too many tabs. Too many subscriptions. Too much time spent organising instead of understanding. Studifree turns your material into one interactive learning space.',
  footnote: 'Scroll to focus the sentence',
}

/* -------------------------------------------------------------------------- */
/* Product experience                                                         */
/* -------------------------------------------------------------------------- */

export const productCopy = {
  eyebrow: '02 / The workspace',
  title: 'An operating system for learning.',
  lead: 'Explanations, flashcards, quizzes and notes are not separate products here. They are layers of the same study session.',
  caption: 'A real learning workspace, not a chat window with extra buttons.',
}

export const productLayers = [
  {
    id: 'teacher',
    label: 'AI teacher',
    meta: 'LIVE EXPLANATION',
    title: 'Photosynthesis, in plain words',
    body: 'A plant uses light to turn carbon dioxide and water into glucose. Oxygen is released along the way.',
    accent: 'blue',
  },
  {
    id: 'flashcard',
    label: 'Flashcard',
    meta: 'ACTIVE RECALL',
    title: 'What is the difference between mitosis and meiosis?',
    body: 'Tap to reveal the answer.',
    accent: 'violet',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    meta: 'CHECKING UNDERSTANDING',
    title: 'What happens to population growth as resources become limited?',
    body: 'The rate slows and levels off near the carrying capacity.',
    accent: 'orange',
  },
  {
    id: 'notes',
    label: 'Notes',
    meta: 'STRUCTURED MATERIAL',
    title: 'Cell division — key points',
    body: 'Definitions, common misconceptions, memory hooks and a knowledge check.',
    accent: 'white',
  },
] as const

/* -------------------------------------------------------------------------- */
/* Learning engine                                                            */
/* -------------------------------------------------------------------------- */

export interface EngineCard {
  id: string
  index: string
  size: 'large' | 'wide' | 'small'
  title: string
  body: string
  meta: string
  accent: 'blue' | 'violet' | 'orange' | 'red' | 'white'
}

export const engineCopy = {
  eyebrow: '03 / The learning engine',
  title: 'More than just AI answers.',
  lead: 'Studifree is built around the actions that actually help you learn: retrieving, testing, explaining and revisiting.',
}

export const engineCards: EngineCard[] = [
  {
    id: 'recall',
    index: '01',
    size: 'large',
    title: 'Active recall',
    body: 'Test yourself instead of rereading. Retrieving an answer is harder than recognising one — and far more useful.',
    meta: 'PRACTICE',
    accent: 'blue',
  },
  {
    id: 'flashcards',
    index: '02',
    size: 'small',
    title: 'Flashcards',
    body: 'Turn information into memory training with cards you can create or generate.',
    meta: 'MEMORY',
    accent: 'violet',
  },
  {
    id: 'explanations',
    index: '03',
    size: 'small',
    title: 'AI explanations',
    body: 'Ask questions until a concept actually makes sense, at the level you need.',
    meta: 'UNDERSTANDING',
    accent: 'orange',
  },
  {
    id: 'adaptive',
    index: '04',
    size: 'small',
    title: 'Adaptive focus',
    body: 'See where your results and reviews suggest spending more attention next.',
    meta: 'ATTENTION',
    accent: 'red',
  },
  {
    id: 'quiz',
    index: '05',
    size: 'small',
    title: 'Quiz mode',
    body: 'Practise retrieval with generated questions, then read the explanation for every answer.',
    meta: 'RETRIEVAL',
    accent: 'white',
  },
  {
    id: 'material',
    index: '06',
    size: 'wide',
    title: 'Study material intelligence',
    body: 'Upload a PDF or bring your own source text. Turn the material you already have into explanations, cards, quizzes and notes.',
    meta: 'UPLOAD → LEARN',
    accent: 'blue',
  },
]

/* -------------------------------------------------------------------------- */
/* Brain / learning principles                                                */
/* -------------------------------------------------------------------------- */

export const brainCopy = {
  eyebrow: '04 / Built for your brain',
  title: 'BUILT FOR YOUR BRAIN.',
  lead: 'No gimmicks. Studifree is shaped around a few well-known learning principles and keeps the explanations simple.',
  note: 'These are study strategies, not medical claims or a guarantee of results.',
}

export const learningPrinciples = [
  {
    id: 'active-recall',
    number: '01',
    title: 'Active recall',
    body: 'Try to remember before you look. The effort of retrieving is part of what makes the memory stronger.',
  },
  {
    id: 'spaced-repetition',
    number: '02',
    title: 'Spaced repetition',
    body: 'Revisit material across increasing gaps instead of cramming it into one long session.',
  },
  {
    id: 'retrieval-practice',
    number: '03',
    title: 'Retrieval practice',
    body: 'Quizzes and flashcards give you a low-pressure way to find out what you actually know.',
  },
  {
    id: 'interleaving',
    number: '04',
    title: 'Interleaving',
    body: 'Mix related topics so your brain has to choose the right approach, not just repeat the last one.',
  },
  {
    id: 'chunking',
    number: '05',
    title: 'Chunking',
    body: 'Break a large subject into smaller ideas, then connect those ideas back into a larger picture.',
  },
] as const

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

export const howItWorksCopy = {
  eyebrow: '05 / The loop',
  title: 'Four steps. One continuous loop.',
  lead: 'Start with what you have. Leave with something you can actually remember.',
}

export const howItWorksSteps = [
  {
    number: '01',
    kicker: 'MATERIAL',
    title: 'Add your study material',
    body: 'Upload a PDF, paste your notes or start with a topic you want to understand.',
    detail: 'Learn · PDF text · Your own source',
  },
  {
    number: '02',
    kicker: 'TRANSFORM',
    title: 'AI transforms it',
    body: 'Turn the same material into explanations, flashcards, quizzes and structured notes.',
    detail: 'Explanations · Cards · Quizzes · Notes',
  },
  {
    number: '03',
    kicker: 'PRACTISE',
    title: 'Actually study',
    body: 'Use the interactive tools instead of passively reading. Test, flip, answer and ask.',
    detail: 'Recall · Practice · Feedback',
  },
  {
    number: '04',
    kicker: 'REMEMBER',
    title: 'Remember more',
    body: 'Revisit what needs attention and build a routine that compounds over time.',
    detail: 'Reviews · Progress · Next step',
  },
] as const

/* -------------------------------------------------------------------------- */
/* AI key                                                                     */
/* -------------------------------------------------------------------------- */

export const aiKeyCopy = {
  eyebrow: '06 / Your AI',
  title: ['YOUR AI.', 'YOUR KEY.', 'YOUR CONTROL.'],
  lead: 'Studifree lets you connect your own AI provider key. Your requests use your own quota — not a shared pool behind a subscription wall.',
  reassurance: "Don't worry — it's easier than it sounds. The setup guide walks through every click.",
  primaryCta: 'Get your AI key',
  secondaryCta: 'Watch a quick tutorial',
  footnote: 'Google AI Studio is free to open. Provider quotas and pricing are set by the provider, not by Studifree.',
}

export const aiKeyBenefits = [
  {
    title: 'Your own quota',
    body: 'Your AI requests are connected through your own provider project, rather than competing for one shared key.',
  },
  {
    title: 'No Studifree subscription',
    body: 'You do not need a paid Studifree plan to use the core study tools or connect a key.',
  },
  {
    title: 'Replace or remove it',
    body: 'Change provider settings whenever you want. Your key can be removed from AI Setup at any time.',
  },
] as const

export const aiKeySteps = [
  {
    number: '01',
    title: 'Open Google AI Studio',
    body: 'Sign in with the Google account you want to use. No payment is required to create a key.',
    action: { label: 'Open AI Studio', href: aiLinks.apiKey, external: true },
  },
  {
    number: '02',
    title: 'Create and copy a key',
    body: 'Press “Create API key”, choose or create a project if prompted, then copy the key.',
    action: { label: 'Read the docs', href: aiLinks.docs, external: true },
  },
  {
    number: '03',
    title: 'Connect it in Studifree',
    body: 'Paste the key into AI Setup and test the connection before your first lesson.',
    action: { label: 'Open AI Setup', href: '/ai-setup', external: false },
  },
] as const

export const tutorialHref =
  'https://www.youtube.com/results?search_query=Google+AI+Studio+Gemini+API+key+tutorial+beginner'

/* -------------------------------------------------------------------------- */
/* Free model                                                                 */
/* -------------------------------------------------------------------------- */

export const freeCopy = {
  eyebrow: '07 / Why free',
  title: ['FREE DOESN’T', 'HAVE TO MEAN', 'LIMITED.'],
  lead: 'Studifree is designed around a different trade-off. Instead of bundling every AI request into a subscription, the learning experience stays open and you control your own AI access.',
  note: 'Honest detail: AI providers may have their own pricing, limits or free quotas. Studifree cannot promise unlimited AI usage from every provider.',
}

export const freePoints = [
  {
    number: '01',
    title: 'Core tools stay open',
    body: 'Manual flashcards, reviews, the planner, focus timer, library and local progress remain usable without AI where supported.',
  },
  {
    number: '02',
    title: 'You own the AI relationship',
    body: 'Connect the provider account you choose. Your usage is governed by that provider’s project, quotas and terms.',
  },
  {
    number: '03',
    title: 'No artificial feature wall',
    body: 'You are not asked to upgrade just to open your own notes, cards or study history.',
  },
  {
    number: '04',
    title: 'Transparent by design',
    body: 'When something depends on a provider or a browser limitation, the interface says so instead of making an absolute promise.',
  },
] as const

/* -------------------------------------------------------------------------- */
/* Privacy                                                                    */
/* -------------------------------------------------------------------------- */

export const privacyCopy = {
  eyebrow: '08 / Privacy',
  title: ['YOUR DATA.', 'YOUR DEVICE.'],
  lead: 'Studifree is designed with a local-first approach. Supported study data lives in your browser on your device, rather than being uploaded to a central study database by default.',
  labels: ['LOCAL-FIRST', 'NO REQUIRED ACCOUNT', 'YOU CONTROL YOUR KEY', 'YOUR STUDY SPACE'],
  note: 'Local-first is a design choice, not an absolute security guarantee. Browser storage can be cleared, and data does not automatically sync across devices unless a future sync option is enabled.',
}

export const privacyLimits = [
  {
    title: 'Browser storage can be cleared',
    body: 'Clearing site data, using private browsing or changing devices may remove local study material. Export important work if you need a backup.',
  },
  {
    title: 'No automatic cross-device sync',
    body: 'Your data does not move between devices by itself. The app is designed around one browser profile at a time.',
  },
  {
    title: 'Local does not mean invisible to everything',
    body: 'Someone with access to the same device and browser profile may be able to open stored information. Treat your device like you would any study notebook.',
  },
] as const

/* -------------------------------------------------------------------------- */
/* Comparison                                                                 */
/* -------------------------------------------------------------------------- */

export const comparisonCopy = {
  eyebrow: '09 / A different approach',
  title: 'A DIFFERENT APPROACH.',
  lead: 'Many study platforms are built around central accounts and subscription tiers. Studifree takes a more local-first, bring-your-own-AI approach. Different tools make different trade-offs — this is ours.',
}

export const comparisonRows = [
  {
    area: 'Account',
    traditional: 'Often account-based',
    studifree: 'Designed to work without a mandatory account',
  },
  {
    area: 'AI access',
    traditional: 'Usually platform-managed',
    studifree: 'Connect your own provider key',
  },
  {
    area: 'AI usage',
    traditional: 'Set by the platform plan',
    studifree: 'Set by your provider project and quota',
  },
  {
    area: 'Storage',
    traditional: 'Often cloud-first',
    studifree: 'Local-first where supported',
  },
  {
    area: 'Cost model',
    traditional: 'Subscription tiers are common',
    studifree: 'Core experience designed to be free; provider costs separate',
  },
] as const

/* -------------------------------------------------------------------------- */
/* Model fallback                                                             */
/* -------------------------------------------------------------------------- */

export const fallbackCopy = {
  eyebrow: '10 / Model resilience',
  title: ['WHEN ONE MODEL', 'STOPS, KEEP GOING.'],
  lead: 'If a configured model becomes temporarily unavailable or returns certain errors, Studifree can attempt the other models you have configured. The goal is simple: fewer interruptions in the middle of a study session.',
  note: 'Fallback is not a promise of infinite uptime. It depends on your available models, API access, provider availability and configuration.',
}

export const fallbackSteps = [
  { id: 'request', label: 'MODEL A', state: 'REQUEST', detail: 'Your selected model receives the task.' },
  { id: 'error', label: 'ERROR', state: 'INTERRUPTED', detail: 'Unavailable, rate-limited or an eligible error.' },
  { id: 'policy', label: 'FALLBACK POLICY', state: 'EVALUATING', detail: 'Checks the remaining configured models.' },
  { id: 'next', label: 'MODEL B', state: 'RETRYING', detail: 'A compatible model receives the same task.' },
  { id: 'continue', label: 'LEARNING CONTINUES', state: 'RECOVERED', detail: 'When a model responds, the session carries on.' },
] as const

/* -------------------------------------------------------------------------- */
/* Study modes                                                                */
/* -------------------------------------------------------------------------- */

export const studyModesCopy = {
  eyebrow: '11 / Study modes',
  title: 'One workspace. Five ways in.',
  lead: 'Choose the mode that fits the moment. Switch without losing the thread.',
}

export interface StudyMode {
  id: string
  label: string
  title: string
  body: string
  detail: string
  chips: string[]
  accent: 'blue' | 'violet' | 'orange' | 'white' | 'red'
}

export const studyModes: StudyMode[] = [
  {
    id: 'learn',
    label: 'Learn',
    title: 'Understand it, step by step.',
    body: 'Ask a question or paste your material. Get an explanation written for your level, then keep asking until it clicks.',
    detail: 'A patient explanation, not a wall of text.',
    chips: ['Explain simply', 'Give an example', 'Go deeper', 'Save as notes'],
    accent: 'blue',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    title: 'Turn information into memory.',
    body: 'Create cards yourself or generate a deck from a topic. Flip, recall and rate how well you knew each answer.',
    detail: 'Active recall with spaced review.',
    chips: ['Generate deck', 'Flip card', 'Rate recall', 'Due reviews'],
    accent: 'violet',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    title: 'Find out what you actually know.',
    body: 'Build a practice quiz from a topic or source text. Answer, submit and read an explanation for every choice.',
    detail: 'Practice and exam-style modes.',
    chips: ['Practice mode', 'Exam mode', 'Timed', 'See explanations'],
    accent: 'orange',
  },
  {
    id: 'notes',
    label: 'Notes',
    title: 'Shape the material into structure.',
    body: 'Turn a lesson into clear sections, key points, definitions, misconceptions and memory hooks you can revisit.',
    detail: 'Structured study material you can keep.',
    chips: ['Key points', 'Definitions', 'Misconceptions', 'Memory hook'],
    accent: 'white',
  },
  {
    id: 'ask',
    label: 'Ask AI',
    title: 'Stay curious about the details.',
    body: 'Ask a follow-up about the thing you are reading. The learning session stays in context instead of sending you somewhere else.',
    detail: 'Questions are part of the workflow.',
    chips: ['Follow up', 'Simplify', 'Compare ideas', 'Check my answer'],
    accent: 'red',
  },
]

/* -------------------------------------------------------------------------- */
/* Beginner                                                                   */
/* -------------------------------------------------------------------------- */

export const beginnerCopy = {
  eyebrow: '12 / No assumed knowledge',
  title: 'YOU DON’T NEED TO BE TECHNICAL.',
  lead: 'Every important feature should explain what it does, why it matters and how to use it. No prior knowledge of API keys, models or study terminology is assumed.',
  note: 'Plain language, visible guidance and a setup path you can follow one step at a time.',
}

export const beginnerPoints = [
  {
    title: 'Plain-language setup',
    body: 'The AI guide explains each step in order, with a visible test before anything is saved.',
  },
  {
    title: 'Guidance inside the app',
    body: 'Tooltips and onboarding explain unfamiliar terms when they appear, not in a manual you have to find.',
  },
  {
    title: 'You can ask for help',
    body: 'The Help Centre covers the tools one by one, including what an API key is and why it exists.',
  },
] as const

/* -------------------------------------------------------------------------- */
/* Founder                                                                    */
/* -------------------------------------------------------------------------- */

export const founderCopy = {
  eyebrow: '13 / Why I built this',
  title: ['WHY I BUILT', 'STUDIFREE.'],
  name: 'Syed Zain-ul Abideen',
  role: 'Founder / Builder',
  paragraphs: [
    'Studying often feels unnecessarily complicated. Students are surrounded by subscriptions, multiple apps, distractions and tools that do not actually help them learn.',
    'I wanted to build something simpler. A place where a student could take their own material and turn it into something they could actually study with. Flashcards. Quizzes. Explanations. Notes. One learning space.',
    'Studifree is built around curiosity and making difficult subjects feel easier to understand — not around adding more noise to the process.',
  ],
  signatureNote: 'Built to make learning feel simpler.',
}

/* -------------------------------------------------------------------------- */
/* Future moment                                                              */
/* -------------------------------------------------------------------------- */

export const futureMomentCopy = {
  eyebrow: '14 / Signal',
  title: 'Information becomes knowledge.',
  note: 'A quiet moment between the noise.',
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface LandingFaqItem {
  id: string
  question: string
  answer: string
}

export const landingFaqItems: LandingFaqItem[] = [
  {
    id: 'really-free',
    question: 'Is Studifree really free?',
    answer:
      'The core learning experience is designed to be free to use. AI features depend on your own provider key, and that provider may have its own quotas, pricing or free-tier limits. Studifree does not promise unlimited AI usage from every provider.',
  },
  {
    id: 'own-key',
    question: 'Why do I need my own AI key?',
    answer:
      'A key connects Studifree to your own AI provider project. That means your requests use your own quota rather than a shared pool, and you stay in control of which provider account is used. The setup guide explains it in plain language.',
  },
  {
    id: 'data-online',
    question: 'Is my data stored online?',
    answer:
      'Supported study data is stored locally in your browser on your device. AI requests send the relevant prompt or material to your configured provider when you ask for AI. Studifree does not automatically upload your whole study library to a central account database.',
  },
  {
    id: 'account',
    question: 'Can I use it without an account?',
    answer:
      'Yes — supported local tools are designed to work without a mandatory Studifree account. AI features still require a configured provider key.',
  },
  {
    id: 'difficult-setup',
    question: 'Is it difficult to set up?',
    answer:
      'It is a short sequence of steps: open Google AI Studio, create a key, copy it, then paste it into AI Setup. The guide shows each step and tests the connection before saving.',
  },
  {
    id: 'model-fails',
    question: 'What happens if an AI model fails?',
    answer:
      'Studifree can attempt another configured model when the current one is unavailable or returns certain errors. Whether fallback succeeds depends on which models you have configured, your API access, provider availability and your settings.',
  },
  {
    id: 'beginners',
    question: 'Can beginners use this?',
    answer:
      'Yes. The interface uses plain language, explains unfamiliar terms and provides a guided setup path. You do not need to understand how AI works to use the study tools.',
  },
  {
    id: 'key-safety',
    question: 'Is my API key safe?',
    answer:
      'In a browser application, a key cannot be guaranteed secret from someone with access to the same device and browser profile. Treat it like a password: do not share it, restrict it where your provider supports restrictions, and remove or rotate it if needed. The Help Centre explains the trade-off honestly.',
  },
  {
    id: 'get-key',
    question: 'Where can I learn how to get an API key?',
    answer:
      'Open the AI key section on this page for the three-step path, or visit AI Setup and the Help Centre. The official Google AI Studio page is linked directly so you can create a key there.',
  },
]

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

export const finalCtaCopy = {
  eyebrow: '15 / Begin',
  title: ['READY TO', 'LEARN', 'DIFFERENTLY?'],
  description: 'Everything you need to understand more, learn better and move forward.',
  primaryCta: 'Open Studifree',
  secondaryCta: 'Learn how it works',
  note: 'No mandatory account for supported local tools · AI is optional · Bring your own key',
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Open App', href: '/home' },
      { label: 'Features', href: '#features' },
      { label: 'AI Setup', href: '/ai-setup' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
]

export const footerCopy = {
  statement: 'Built to make learning feel simpler.',
  credit: 'Created by Syed Zain-ul Abideen',
  note: 'Studifree is an independent learning project.',
}
