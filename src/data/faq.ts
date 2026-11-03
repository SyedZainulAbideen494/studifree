export type FaqCategoryId =
  | 'getting-started'
  | 'ai-api-keys'
  | 'features'
  | 'privacy-data'
  | 'accounts-storage'
  | 'general'

export interface FaqCategory {
  id: FaqCategoryId
  label: string
  description: string
}

export interface FaqItem {
  id: string
  category: FaqCategoryId
  question: string
  answer: string
}

export const faqCategories: FaqCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description: 'What Studifree is, who it is for and how to begin.',
  },
  {
    id: 'ai-api-keys',
    label: 'AI & API Keys',
    description: 'How AI access works, where to get a key and what happens when a model fails.',
  },
  {
    id: 'features',
    label: 'Features',
    description: 'What you can study, create and track inside the app.',
  },
  {
    id: 'privacy-data',
    label: 'Privacy & Data',
    description: 'Where your work lives, what is sent and how to stay in control.',
  },
  {
    id: 'accounts-storage',
    label: 'Accounts & Storage',
    description: 'Accounts, backups and moving between devices.',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Independence, accuracy and the future of the project.',
  },
]

export const faqItems: FaqItem[] = [
  // Getting started
  {
    id: 'what-is-studifree',
    category: 'getting-started',
    question: 'What is Studifree?',
    answer:
      'Studifree is a learning platform designed to help people understand topics, create study materials, practise and organise their learning in one place.',
  },
  {
    id: 'who-can-use',
    category: 'getting-started',
    question: 'Who can use Studifree?',
    answer:
      'Anyone who wants to learn. It is designed for school students, university students, examination candidates, professionals and lifelong learners.',
  },
  {
    id: 'need-account',
    category: 'getting-started',
    question: 'Do I need to create an account?',
    answer: 'No mandatory account is required for the supported local learning features.',
  },
  {
    id: 'get-started',
    category: 'getting-started',
    question: 'How do I get started?',
    answer:
      'Open Studifree, choose a learning feature and start exploring. For AI-powered features, configure a supported AI provider first.',
  },

  // AI & API keys
  {
    id: 'why-api-key',
    category: 'ai-api-keys',
    question: 'Why does Studifree need an API key?',
    answer:
      'AI-powered features need access to an AI provider. Your API key allows Studifree to send requests to the provider using your account.',
  },
  {
    id: 'is-gemini-free',
    category: 'ai-api-keys',
    question: 'Is the Gemini API free?',
    answer:
      "Google provides different usage tiers and pricing depending on the model and account. Check Google's official pricing page at https://ai.google.dev/gemini-api/docs/pricing for current information.",
  },
  {
    id: 'where-get-key',
    category: 'ai-api-keys',
    question: 'Where can I get my Gemini API key?',
    answer:
      'Visit Google AI Studio at https://aistudio.google.com/app/apikey, sign in with your Google account, create a key and copy it into AI Setup.',
  },
  {
    id: 'without-key',
    category: 'ai-api-keys',
    question: 'Can I use Studifree without an API key?',
    answer:
      'Yes. Manual learning functionality and other local features can still be used where supported. AI-powered generation requires an API key.',
  },
  {
    id: 'ai-location',
    category: 'ai-api-keys',
    question: 'Does AI use my location?',
    answer:
      'Not automatically. If you allow location personalisation, the AI teacher can use only your general country and region, and only when you switch on “Use regional context” for that request. Precise coordinates are never sent to the AI provider. You can use every AI feature with the switch left off.',
  },
  {
    id: 'change-model',
    category: 'ai-api-keys',
    question: 'Can I change my AI model?',
    answer:
      'If multiple compatible models are available to your API key, you can select from the models supported by Studifree in Settings → AI Setup.',
  },
  {
    id: 'model-stops-working',
    category: 'ai-api-keys',
    question: 'What happens if an AI model stops working?',
    answer:
      "Studifree's model manager can attempt to switch to another compatible model when automatic fallback is enabled. Availability depends on your API access and the requested task.",
  },

  // Features
  {
    id: 'any-subject',
    category: 'features',
    question: 'Can I study any subject?',
    answer: 'Yes. Studifree is intended for a wide range of subjects and learning goals.',
  },
  {
    id: 'flashcards-from-pdfs',
    category: 'features',
    question: 'Can I generate flashcards from PDFs?',
    answer: 'Yes, where supported by the document processing and AI configuration.',
  },
  {
    id: 'create-quizzes',
    category: 'features',
    question: 'Can I create quizzes?',
    answer: 'Yes. Quiz Studio supports practice and assessment workflows.',
  },
  {
    id: 'track-progress',
    category: 'features',
    question: 'Can I track my progress?',
    answer: 'Yes. Studifree tracks supported learning activity and progress using saved local data.',
  },
  {
    id: 'on-phone',
    category: 'features',
    question: 'Can I use Studifree on my phone?',
    answer: 'Yes. The application is designed to work across mobile, tablet and desktop screens.',
  },

  // Privacy & data
  {
    id: 'where-data-stored',
    category: 'privacy-data',
    question: 'Where is my study data stored?',
    answer:
      "Supported learning data is stored locally in your browser using the application's local storage system. If you allow location personalisation, only a general country and region are stored alongside it. Precise coordinates are never saved.",
  },
  {
    id: 'collect-location',
    category: 'privacy-data',
    question: 'Does Studifree collect my location?',
    answer:
      'Only if you choose to allow it. Studifree asks once for optional location personalisation. If you allow it and your browser grants permission, your coordinates are used to look up a general country and region. Precise coordinates are not stored in your browser and are not sent to the AI provider; only the country and region are saved locally. If you decline, no location is read.',
  },
  {
    id: 'disable-location',
    category: 'privacy-data',
    question: 'Can I disable location personalisation?',
    answer:
      'Yes. Open Settings → Location personalisation to disable or reset the choice. You can also revoke the browser’s location permission in your browser’s site settings. Disabling it never blocks Studifree or any learning feature.',
  },
  {
    id: 'key-secure',
    category: 'privacy-data',
    question: 'Is my API key completely secure?',
    answer:
      'Browser-based API key storage is not completely secure. Users should understand the risks and restrict their keys where supported.',
  },
  {
    id: 'lose-data',
    category: 'privacy-data',
    question: 'Will I lose my study data if I clear browser storage?',
    answer:
      'Clearing browser storage can remove locally stored study data. Use Settings → Export data regularly to keep a backup of important information.',
  },

  // Accounts & storage
  {
    id: 'without-signing-in',
    category: 'accounts-storage',
    question: 'Can I use Studifree without signing in?',
    answer: 'Yes, for supported local functionality. There is no mandatory account for the core learning tools.',
  },
  {
    id: 'backup-materials',
    category: 'accounts-storage',
    question: 'Can I back up my learning materials?',
    answer:
      'Yes. Settings → Export data downloads a JSON file containing your lessons, decks, cards, quizzes, results and settings. Import the same file to restore them. There is no cloud backup.',
  },
  {
    id: 'multiple-devices',
    category: 'accounts-storage',
    question: 'Can I use Studifree on multiple devices?',
    answer:
      'Local data does not automatically synchronise across devices. You can move your work by exporting from one device and importing on another.',
  },

  // General
  {
    id: 'affiliation',
    category: 'general',
    question: 'Is Studifree affiliated with any examination authority?',
    answer:
      'No. Studifree is an independent learning platform and implies no official affiliation with any examination authority.',
  },
  {
    id: 'ai-mistakes',
    category: 'general',
    question: 'Can AI-generated answers contain mistakes?',
    answer:
      'Yes. AI can make mistakes, so learners should verify important facts, calculations and examination-related information against reliable sources.',
  },
  {
    id: 'feedback',
    category: 'general',
    question: 'How can I share feedback?',
    answer:
      'There is no in-app feedback form yet. For problems or questions, start with the Help Centre, which covers AI setup, storage and troubleshooting.',
  },
  {
    id: 'still-evolving',
    category: 'general',
    question: 'Is Studifree still evolving?',
    answer:
      'Yes. Studifree is an evolving project, and its features and capabilities may improve over time.',
  },
]

/** Filter FAQs by category and a keyword search. Pure and easy to test. */
export function filterFaq(
  items: FaqItem[],
  category: FaqCategoryId | 'all',
  query: string,
): FaqItem[] {
  const q = query.trim().toLowerCase()
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (!q) return true
    return `${item.question} ${item.answer}`.toLowerCase().includes(q)
  })
}
