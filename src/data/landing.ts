import { aiLinks } from './aiLinks'

export interface LandingNavItem {
  label: string
  href: string
}

export const landingNavItems: LandingNavItem[] = [
  { label: 'System', href: '#showcase' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why Studifree', href: '#why-studifree' },
  { label: 'FAQ', href: '#faq' },
]

export const heroCopy = {
  eyebrow: 'Studifree // Learning intelligence',
  titleLines: ['LEARNING,', 'RE-ENGINEERED.'],
  description:
    'One intelligent learning space. Built around the way you think, learn and grow.',
  primaryCta: 'Start learning',
  secondaryCta: 'Explore the system',
  trust: 'No mandatory account · Core tools free · Bring your own AI key',
  status: 'System online · Local-first architecture',
  coordinates: 'SF—01 / 2026 / BROWSE',
}

export interface FeatureStory {
  id: string
  index: string
  label: string
  title: string
  description: string
  points: string[]
  to: string
  cta: string
}

export const featureStories: FeatureStory[] = [
  {
    id: 'feature-ai-teacher',
    index: '01',
    label: 'AI Personal Teacher',
    title: 'Finally, an explanation that makes sense.',
    description:
      'Meet your personal AI learning assistant. Explore any topic, break complicated concepts into smaller ideas, ask questions and learn at your own pace.',
    points: [
      'Learn any topic from a question or a starting point',
      'Step-by-step explanations written for your level',
      'Beginner-friendly teaching with examples and analogies',
      'Follow-up questions when something still feels unclear',
      'PDF text and image understanding when you ask AI to process them',
      'Save lessons, export them as a PDF or generate revision material',
    ],
    to: '/learn',
    cta: 'Open Learn',
  },
  {
    id: 'feature-flashcards',
    index: '02',
    label: 'Smart Flashcards',
    title: 'Remember what matters.',
    description:
      'Turn a topic into a deck, or write cards yourself. Review with active recall and spaced repetition instead of simply rereading your notes.',
    points: [
      'AI-generated cards from a topic you choose',
      'Manual card creation for exactly what you need',
      'Decks to keep subjects and topics organised',
      'Flip interactions for active recall',
      'Spaced repetition scheduled by how you rate each card',
      'Due reviews and local review history',
    ],
    to: '/flashcards',
    cta: 'Open Flashcards',
  },
  {
    id: 'feature-quiz',
    index: '03',
    label: 'Quiz Studio',
    title: "Don't just study it. Test it.",
    description:
      'Create a practice quiz from a topic or your own source text, test your understanding and discover the concepts that deserve more attention.',
    points: [
      'Multiple-choice questions generated from your material',
      'Difficulty selection for mixed, easier or harder practice',
      'Practice, exam, timed and untimed modes',
      'Answer explanations after submission',
      'Results and weak-concept identification',
      'Quiz history saved locally',
    ],
    to: '/quiz',
    cta: 'Open Quiz Studio',
  },
  {
    id: 'feature-notes',
    index: '04',
    label: 'AI Notes',
    title: 'From information to understanding.',
    description:
      'Every AI lesson can become organised study material: clear definitions, structured sections, important points, common misconceptions and a memory trick.',
    points: [
      'Structured lesson sections instead of one long answer',
      'Important points and definitions pulled together',
      'Common misconceptions to watch for',
      'Memory tricks and a knowledge check',
      'Source material from a topic, PDF text or images',
      'Save lessons to your local library and export as a PDF',
    ],
    to: '/learn',
    cta: 'Open Learn',
  },
  {
    id: 'feature-planner',
    index: '05',
    label: 'Study Planner',
    title: 'Make time for what matters.',
    description:
      'Bring structure to your study routine. Plan what needs doing, set a daily goal and use a focus timer to keep your learning moving forward.',
    points: [
      'A daily study goal in minutes',
      'Planner items with due dates and completion state',
      'Work and break modes in the focus timer',
      'Study sessions recorded locally when you finish a timer',
      'A clear view of what is due next',
      'Everything stays on your device',
    ],
    to: '/planner',
    cta: 'Open Planner',
  },
  {
    id: 'feature-progress',
    index: '06',
    label: 'Progress & Insights',
    title: "See how far you've come.",
    description:
      'Learning becomes more motivating when you can see your progress. Review your activity, understand your strengths and find the topics that need more practice.',
    points: [
      'Learning activity from your local study data',
      'Quiz scores and recent results',
      'Flashcard counts and due reviews',
      'Concept mastery distribution',
      'Weak topics and a recommended next step',
      'Built from your device data, not invented community statistics',
    ],
    to: '/progress',
    cta: 'Open Progress',
  },
  {
    id: 'feature-library',
    index: '07',
    label: 'Personal Library',
    title: 'Your learning, all in one place.',
    description:
      'Keep saved lessons, flashcard decks and quizzes together in one personal library, ready to reopen, rename or remove.',
    points: [
      'Saved AI lessons in one list',
      'Flashcard decks and their review material',
      'Generated quizzes and past attempts',
      'Open an item and continue where you left off',
      'Rename or remove items you no longer need',
      'Stored in your browser on your own device',
    ],
    to: '/library',
    cta: 'Open Library',
  },
]

export const finalCtaCopy = {
  eyebrow: 'Begin',
  title: 'YOUR NEXT CHAPTER STARTS HERE.',
  description:
    'Everything you need to understand more, learn better and move forward.',
  primaryCta: 'Start learning',
  secondaryCta: 'Explore Studifree',
  note: 'No mandatory account for supported local tools · AI is optional · Bring your own key',
}

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Choose what you want to learn',
    description: 'Start with a topic, ask a question or use your own study material.',
    detail: 'Learn, Flashcards, Quiz Studio and Planner all begin with a simple choice.',
  },
  {
    number: '02',
    title: 'Learn your way',
    description:
      'Explore explanations, create notes, practise with flashcards and challenge yourself with quizzes.',
    detail: 'Use the tools together, or pick the one that fits the way you study today.',
  },
  {
    number: '03',
    title: 'Improve with every session',
    description:
      'Review your progress, revisit difficult topics and build a consistent learning routine.',
    detail: 'Your local progress view helps you decide what deserves the next session.',
  },
]

export const freeCoreFeatures = [
  'Manual flashcard creation',
  'Spaced-repetition reviews and confidence ratings',
  'Deck organisation',
  'Study planner, daily goals and due items',
  'Focus timer with work and break modes',
  'Personal library of saved lessons, decks and quizzes',
  'Local progress tracking from your activity',
  'Export and import of supported study data',
  'Theme, motion and study preferences',
]

export const aiPoweredFeatures = [
  'AI Personal Teacher explanations',
  'Simpler explanations, extra examples and step-by-step support',
  'Structured AI lesson notes and summaries',
  'AI-generated flashcards from a topic',
  'AI-generated quizzes from a topic or source text',
  'PDF text and image understanding in Learn',
  'Compatible Gemini model selection and fallback',
]

export interface TechNode {
  id: string
  label: string
  short: string
  description: string
  detail: string
}

export const techNodes: TechNode[] = [
  {
    id: 'application',
    label: 'Studifree application',
    short: 'The learning interface',
    description:
      'Studifree runs in your browser. You use Learn, Flashcards, Quiz Studio, Planner, Progress and Library directly in the application.',
    detail:
      'No mandatory account is needed for supported local tools. The interface is a React application, and AI is an optional part of the experience rather than the whole product.',
  },
  {
    id: 'storage',
    label: 'Local device storage',
    short: 'Where your study work lives',
    description:
      'Supported learning data is saved in your browser using IndexedDB and, for smaller settings, LocalStorage.',
    detail:
      'IndexedDB stores structured records such as lessons, decks, cards, quizzes, results, concepts, sessions, planner items, goals, library entries and file metadata. LocalStorage holds lighter preferences and configuration.',
  },
  {
    id: 'key',
    label: 'Your API key',
    short: 'The optional AI connection',
    description:
      'When you use an AI feature, your configured Gemini API key authenticates the request to Google.',
    detail:
      'The key belongs to your own Google AI project. In a browser-only app it is stored in this browser profile as part of your settings. That is convenient, but it cannot be guaranteed secret from someone with access to the device or browser profile.',
  },
  {
    id: 'provider',
    label: 'Google Gemini API',
    short: 'Optional AI processing',
    description:
      'AI requests are sent to Google Gemini only when you use an AI-powered feature. Google processes the request under your project.',
    detail:
      'Prompts and the relevant material you submit are sent for processing. Uploaded PDFs are parsed locally first; extracted text or images are included only when you request AI processing. Google’s terms, quotas and data-handling policies apply.',
  },
  {
    id: 'response',
    label: 'AI response',
    short: 'Back into your learning space',
    description:
      'The provider returns a response to Studifree, where it appears as an explanation, notes, flashcards or quiz questions.',
    detail:
      'You decide what to keep. Saved lessons and generated study material can be stored locally in your library so you can return to them later without regenerating everything.',
  },
]

export const storageBuckets = [
  {
    id: 'indexeddb',
    label: 'IndexedDB',
    badge: 'Structured study data',
    summary:
      'A browser database used through Dexie for larger, structured learning records. It is the main home for your study work.',
    items: [
      'Lessons and their saved content',
      'Flashcard decks and cards',
      'Quizzes and quiz results',
      'Concept mastery records',
      'Study sessions and planner items',
      'Daily goals, library entries and file metadata',
    ],
  },
  {
    id: 'localstorage',
    label: 'LocalStorage',
    badge: 'Settings & preferences',
    summary:
      'A smaller key-value store used for interface choices and lightweight application configuration.',
    items: [
      'Theme, effects and study preferences',
      'AI settings, including your API key',
      'Model cache, health and fallback policy',
      'AI verification state',
      'Visitor email cooldown timestamp',
      'Location consent and separate analytics preference',
    ],
  },
  {
    id: 'external',
    label: 'Sent externally',
    badge: 'Only for disclosed purposes',
    summary:
      'Some parts of the experience communicate with external services. Opening the app alone does not upload your study library.',
    items: [
      'AI prompts and relevant material → Google Gemini, when you request AI',
      'Visitor notification fields and IP → EmailJS and ipify',
      'Coordinates for reverse geocoding → BigDataCloud, after consent',
      'Precise location in analytics → only with a separate explicit opt-in',
    ],
  },
] as const

export interface ComparisonRow {
  area: string
  traditional: string
  studifree: string
}

export const comparisonRows: ComparisonRow[] = [
  {
    area: 'AI access',
    traditional: 'Often bundled into a paid plan',
    studifree: 'Connect your own provider key',
  },
  {
    area: 'AI usage limits',
    traditional: 'Set by the platform plan',
    studifree: 'Set by the provider and your project',
  },
  {
    area: 'AI costs',
    traditional: 'Subscription or usage fees',
    studifree: 'Provider pricing, including eligible free-tier usage',
  },
  {
    area: 'Core local tools',
    traditional: 'Varies by platform',
    studifree: 'Available without AI where supported',
  },
  {
    area: 'Account',
    traditional: 'Varies by platform',
    studifree: 'No mandatory account for supported local features',
  },
  {
    area: 'Storage',
    traditional: 'Varies by platform',
    studifree: 'Local-first where supported',
  },
  {
    area: 'Model choice',
    traditional: 'Varies by platform',
    studifree: 'Compatible models supported by Studifree',
  },
]

export const externalServices = [
  {
    name: 'Google Gemini API',
    purpose: 'Processes AI requests when you ask for an explanation, notes, flashcards or a quiz.',
    data: 'Your prompt and the relevant material you submit, plus authentication through your API key.',
  },
  {
    name: 'EmailJS',
    purpose: 'Sends the optional visitor notification configured for the site.',
    data: 'Page URL, time, browser and device details, language, timezone, referrer and platform.',
  },
  {
    name: 'ipify',
    purpose: 'Looks up the public IP address included in that visitor notification.',
    data: 'A network request that returns your public IP address.',
  },
  {
    name: 'BigDataCloud',
    purpose: 'Turns consented coordinates into a coarse country and region.',
    data: 'Latitude and longitude in the reverse-geocode request. Coordinates are not stored by Studifree.',
  },
] as const

export const securityNotes = [
  {
    title: 'Local data',
    body: 'Browser storage is not automatically encrypted just because it is local. Someone with access to the same device and browser profile may be able to read stored information. Browser extensions and malicious scripts can introduce risks, and clearing browser storage can remove your data.',
  },
  {
    title: 'AI requests',
    body: 'When you use AI features, your prompt and relevant submitted content are sent to your configured AI provider for processing. Provider privacy and retention policies apply. Avoid submitting sensitive information you do not need to share.',
  },
  {
    title: 'Your API key',
    body: 'Your key authenticates requests to Google. In a browser-only application, a frontend key cannot be guaranteed secret. Restrict keys where Google supports it, never share them publicly, rotate exposed keys and remove the key from AI Setup if you no longer need it.',
  },
  {
    title: 'External services',
    body: 'Studifree is not a no-server application. AI requests, visitor notifications, IP lookup and optional reverse geocoding use the external services listed here. The Help Centre explains these purposes in more detail.',
  },
] as const

export const beginnerSteps = [
  'Open Google AI Studio.',
  'Sign in with your Google account.',
  'Create an API key.',
  'Copy the key.',
  'Paste it into Studifree AI Setup.',
  'Test the connection.',
  'Start learning.',
] as const

export const youtubeTutorialSearch =
  'https://www.youtube.com/results?search_query=Google+AI+Studio+Gemini+API+key+tutorial+beginner'

export const aiKeySteps = [
  {
    number: '01',
    title: 'Open Google AI Studio',
    body: 'Visit the official API key page and sign in with the Google account you want to use.',
    action: { label: 'Get my API key', href: aiLinks.apiKey, external: true },
  },
  {
    number: '02',
    title: 'Create your key',
    body: 'Press “Create API key”, choose or create a Google Cloud project if prompted, then copy the key.',
    action: { label: 'Gemini API documentation', href: aiLinks.docs, external: true },
  },
  {
    number: '03',
    title: 'Connect it to Studifree',
    body: 'Return to Studifree, open AI Setup, paste your key and test the connection before you start.',
    action: { label: 'Open AI Setup', href: '/ai-setup', external: false },
  },
] as const

export const principles = [
  {
    number: '01',
    title: 'Accessible learning',
    body: 'Useful learning tools should be within reach.',
  },
  {
    number: '02',
    title: 'Understanding first',
    body: 'We want to help learners understand concepts, not simply memorise answers.',
  },
  {
    number: '03',
    title: 'Learning at your own pace',
    body: 'Everyone learns differently. Your learning experience should be flexible.',
  },
  {
    number: '04',
    title: 'Technology with purpose',
    body: 'AI should support curiosity and independent thinking, not replace them.',
  },
] as const

export type LandingFaqCategoryId =
  | 'getting-started'
  | 'ai-api-keys'
  | 'features'
  | 'privacy'
  | 'general'

export interface LandingFaqCategory {
  id: LandingFaqCategoryId
  label: string
  description: string
}

export const landingFaqCategories: LandingFaqCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    description: 'What Studifree is, who it is for and how to begin.',
  },
  {
    id: 'ai-api-keys',
    label: 'AI & API keys',
    description: 'The BYOK model, Gemini setup, quotas and model choice.',
  },
  {
    id: 'features',
    label: 'Features',
    description: 'What you can learn, create, upload and track.',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Where your data lives and what is sent externally.',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Independence, accuracy, devices and the road ahead.',
  },
]

export interface LandingFaqItem {
  id: string
  category: LandingFaqCategoryId
  question: string
  answer: string
}

export const landingFaqItems: LandingFaqItem[] = [
  // Getting started
  {
    id: 'what-is-studifree',
    category: 'getting-started',
    question: 'What is Studifree?',
    answer:
      'Studifree is a browser-based learning workspace. It brings AI-assisted explanations, flashcards, quizzes, a study planner, progress insights and a personal library into one application. Supported study data is stored locally in your browser.',
  },
  {
    id: 'how-does-it-work',
    category: 'getting-started',
    question: 'How does Studifree work?',
    answer:
      'Studifree runs as a browser-based learning application. Supported study materials are stored locally using IndexedDB and LocalStorage, while AI-powered features send the relevant request to your configured AI provider. You do not need an account for supported local tools.',
  },
  {
    id: 'who-can-use',
    category: 'getting-started',
    question: 'Who can use it?',
    answer:
      'Anyone who wants to learn: school students, university students, examination candidates, professionals and lifelong learners. Studifree is designed for a wide range of subjects and goals.',
  },
  {
    id: 'need-account',
    category: 'getting-started',
    question: 'Is an account required?',
    answer:
      'No mandatory account is required for supported local learning features. There is no sign-up wall for the core tools, and your study data stays in your browser.',
  },
  {
    id: 'how-start',
    category: 'getting-started',
    question: 'How do I start learning?',
    answer:
      'Open the app and choose a tool: Learn for an AI explanation, Flashcards for recall practice, Quiz Studio to test yourself, or Planner to organise a session. For AI-powered tools, connect a Gemini API key in AI Setup first.',
  },
  {
    id: 'is-free',
    category: 'getting-started',
    question: 'Is Studifree free?',
    answer:
      'The core local learning tools are free to use without a Studifree subscription. AI features use your own Gemini API key, so Google’s quotas and pricing for your account and project apply. Eligible models and accounts may have free-tier usage, but it is not guaranteed.',
  },
  {
    id: 'multiple-devices',
    category: 'getting-started',
    question: 'Can I use it on multiple devices?',
    answer:
      'Yes, you can open Studifree on multiple devices, but local study data does not automatically synchronise between them because there is no cloud sync feature. You can export supported data from one device and import it on another.',
  },
  {
    id: 'programming-knowledge',
    category: 'getting-started',
    question: 'Do I need programming knowledge?',
    answer:
      'No. API key setup is a short, beginner-friendly process: sign in, create a key, copy it and paste it into AI Setup. You do not need to write or understand code.',
  },

  // AI & API keys
  {
    id: 'why-own-key',
    category: 'ai-api-keys',
    question: 'Why do I need my own API key?',
    answer:
      'Your key authenticates your requests to the AI provider. This gives you access to the quota and pricing associated with your own Google AI project instead of relying on a shared Studifree AI allowance. It also means AI processing is tied to an account you control.',
  },
  {
    id: 'does-studifree-have-ai',
    category: 'ai-api-keys',
    question: 'Does Studifree have its own AI?',
    answer:
      'Studifree provides the learning interface and the AI integration. AI processing is performed by the configured provider, such as Google Gemini. The app does not claim to train or host its own language model.',
  },
  {
    id: 'is-gemini-free',
    category: 'ai-api-keys',
    question: 'Is Gemini free?',
    answer:
      'Google may provide free-tier usage for eligible Gemini models and accounts. Depending on your account, selected model and current quotas, you may be able to use AI features without paying. Google controls quotas, pricing and availability, so free access is not guaranteed for every model or amount of usage. Check Google’s official pricing page for current details.',
  },
  {
    id: 'where-get-key',
    category: 'ai-api-keys',
    question: 'Where do I get a key?',
    answer:
      'Open Google AI Studio from the AI key section on this page, sign in with your Google account, create an API key and copy it. Then return to Studifree, open AI Setup and paste the key.',
  },
  {
    id: 'without-ai',
    category: 'ai-api-keys',
    question: 'Can I use Studifree without AI?',
    answer:
      'Yes. Manual flashcards, spaced-repetition reviews, deck organisation, the planner, daily goals, the focus timer, your local library and progress tracking remain available without configuring an AI provider.',
  },
  {
    id: 'change-models',
    category: 'ai-api-keys',
    question: 'Can I change AI models?',
    answer:
      'Yes, where your key has access to compatible models. AI Setup includes model management, and Studifree can discover available Gemini models and use fallback when a model is unavailable or busy.',
  },
  {
    id: 'reach-quota',
    category: 'ai-api-keys',
    question: 'What happens if I reach my quota?',
    answer:
      'Google may reject the request or return a quota error. Studifree shows a friendly message, and you can wait for the quota to reset, choose another compatible model, or review the limits and billing for your Google AI project. There is no shared Studifree AI allowance to fall back on.',
  },
  {
    id: 'data-to-google',
    category: 'ai-api-keys',
    question: 'Does my data go to Google?',
    answer:
      'When you use AI features, the relevant prompt and submitted material are sent to Google Gemini for processing if Gemini is your configured provider. Merely opening Studifree or using local study tools does not upload your library. Visitor notifications and IP lookup are separate services.',
  },

  // Features
  {
    id: 'any-subject',
    category: 'features',
    question: 'Can I study any subject?',
    answer:
      'Studifree is intended for a wide range of subjects and learning goals. AI output quality varies by topic, and you should verify important facts and calculations.',
  },
  {
    id: 'create-flashcards',
    category: 'features',
    question: 'Can I create flashcards?',
    answer:
      'Yes. You can create decks and add cards manually, or generate cards from a topic with AI when your key is configured. Reviews use spaced repetition and confidence ratings.',
  },
  {
    id: 'generate-quizzes',
    category: 'features',
    question: 'Can I generate quizzes?',
    answer:
      'Yes, with an AI key. Quiz Studio generates multiple-choice questions from a topic or source text. You can choose practice, exam, timed or untimed modes and review explanations after submission.',
  },
  {
    id: 'upload-pdfs',
    category: 'features',
    question: 'Can I upload PDFs?',
    answer:
      'Yes, in Learn. PDF text is extracted in your browser. When you request AI processing, the relevant extracted text or uploaded images are sent to your configured AI provider. A scanned PDF may be rendered to images for processing where supported.',
  },
  {
    id: 'track-progress',
    category: 'features',
    question: 'Can I track my progress?',
    answer:
      'Yes. Progress uses your local activity, including quiz results, flashcard counts, study sessions and concept mastery. It is built from data on your device rather than community averages.',
  },

  // Privacy
  {
    id: 'where-data-stored',
    category: 'privacy',
    question: 'Where is my data stored?',
    answer:
      'Supported learning data is stored locally in your browser using IndexedDB and LocalStorage where implemented. IndexedDB holds structured study records, while LocalStorage holds settings and lightweight configuration. There is no automatic cloud sync.',
  },
  {
    id: 'collect-location',
    category: 'privacy',
    question: 'Does Studifree collect location?',
    answer:
      'Only if you choose to allow it. Studifree asks once per browser. If you allow it and the browser grants permission, coordinates are used to look up a general country and region. Precise coordinates are not stored in your browser and are not sent to the AI provider. You can change or clear this in Settings.',
  },
  {
    id: 'key-secure',
    category: 'privacy',
    question: 'Is my API key completely secure?',
    answer:
      'No browser-based key storage can be guaranteed completely secure. Your key is stored in this browser profile and used by the page, so someone with access to the profile or enough technical knowledge of the running page may be able to read it. Restrict keys where possible, avoid shared devices and remove or rotate a key if it may have been exposed.',
  },
  {
    id: 'ai-receives-documents',
    category: 'privacy',
    question: 'Does AI receive my uploaded documents?',
    answer:
      'A document is not sent just because you select it. In Learn, PDF text is extracted locally. When you request AI processing, the relevant extracted text and any uploaded images needed for that request are sent to your configured AI provider. Upload only material you have the right to use.',
  },
  {
    id: 'local-storage-secure',
    category: 'privacy',
    question: 'Is local storage completely secure?',
    answer:
      'No storage method is completely risk-free. Local browser storage gives you more control over where supported learning data is kept, but it is not automatically encrypted and can be accessed by someone with access to your browser profile. Clearing browser data can also remove it, so keep backups of important material.',
  },
  {
    id: 'better-than-quizlet',
    category: 'privacy',
    question: 'Is Studifree better than Quizlet?',
    answer:
      'Studifree and Quizlet have different approaches and features. Studifree focuses on local-first study functionality and a bring-your-own-AI-key model. This can appeal to learners who prefer individual AI usage control and do not want a mandatory Studifree subscription. Compare each platform’s current features, pricing and privacy policies before choosing; Studifree does not claim to be better for every learner.',
  },

  // General
  {
    id: 'affiliation',
    category: 'general',
    question: 'Is Studifree affiliated with any education board?',
    answer:
      'No. Studifree is an independent learning project and implies no official affiliation with any examination authority, school or education board.',
  },
  {
    id: 'ai-mistakes',
    category: 'general',
    question: 'Can AI make mistakes?',
    answer:
      'Yes. AI-generated content can be incorrect, incomplete or biased. Verify important facts, calculations and examination-related answers against reliable sources, and do not rely on AI for safety-critical decisions.',
  },
  {
    id: 'on-mobile',
    category: 'general',
    question: 'Can I use Studifree on mobile?',
    answer:
      'Yes. Studifree is designed to work across phones, tablets and desktop screens, with responsive layouts and touch-friendly controls.',
  },
  {
    id: 'still-evolving',
    category: 'general',
    question: 'Is Studifree still evolving?',
    answer:
      'Yes. Studifree is an evolving project. Features, model support and documentation may change as the application improves. The Help Centre describes the current behaviour.',
  },
]

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features', external: false },
      { label: 'AI Personal Teacher', href: '#feature-ai-teacher', external: false },
      { label: 'Flashcards', href: '#feature-flashcards', external: false },
      { label: 'Quiz Studio', href: '#feature-quiz', external: false },
      { label: 'Study Planner', href: '#feature-planner', external: false },
      { label: 'Progress', href: '#feature-progress', external: false },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Centre', href: '/help', external: false },
      { label: 'AI Setup Guide', href: '/ai-setup', external: false },
      { label: 'FAQ', href: '#faq', external: false },
      { label: 'About Studifree', href: '/about', external: false },
    ],
  },
] as const
