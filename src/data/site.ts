/**
 * Single source of truth for public brand and search metadata.
 *
 * The deployment origin is intentionally never hard-coded. Absolute URLs are
 * derived from `window.location.origin` at runtime, or from `VITE_SITE_URL`
 * during a production build when the host is known.
 */

export const SITE = {
  name: 'Studifree',
  title: 'Studifree – Free AI Study Tools, Flashcards, Quizzes & Smart Learning',
  description:
    'Studifree is a modern AI-powered study companion for creating notes, flashcards and quizzes. Learn smarter and organize your study with supported AI and your own API key.',
  socialTitle: 'Studifree — Learn differently.',
  socialDescription:
    'Studifree is a modern AI-powered study companion for creating notes, flashcards and quizzes. Learn smarter and organize your study with supported AI and your own API key.',
  socialImage: '/og-image.png',
  socialImageWidth: 1200,
  socialImageHeight: 630,
  socialImageAlt:
    'Studifree social preview: Learn differently. A dark study workspace with notes, flashcards and quizzes.',
  author: 'Syed Zain-ul-Abideen',
  themeColor: '#000000',
  tagline: 'Learn differently.',
  philosophy: 'Learning should be for everyone.',
  language: 'en',
  locale: 'en_GB',
  keywords: [
    'Studifree',
    'AI study app',
    'AI learning tools',
    'AI flashcards',
    'AI quiz generator',
    'study smarter',
    'flashcard app',
    'AI notes',
    'student productivity',
    'BYOK AI',
    'bring your own key AI',
    'study companion',
    'revision tools',
    'free study tools',
    'AI education',
  ],
} as const

export interface RouteMeta {
  title: string
  description: string
  /** Public marketing pages are indexable. Application screens are not. */
  indexable: boolean
  /** Canonical path. Falls back to the live pathname. */
  path?: string
  socialTitle?: string
  socialDescription?: string
}

const pageMeta: Record<string, RouteMeta> = {
  '/': {
    title: SITE.title,
    description: SITE.description,
    indexable: true,
    path: '/',
    socialTitle: SITE.socialTitle,
    socialDescription: SITE.socialDescription,
  },
  '/about': {
    title: 'About Studifree — Learning Should Be for Everyone',
    description:
      'Studifree is an independent learning project. Read why it exists, what it believes and how it approaches AI and privacy.',
    indexable: true,
    path: '/about',
    socialTitle: 'About Studifree — Learning Should Be for Everyone',
    socialDescription:
      'Studifree is an independent learning project built around a simple belief: useful learning tools should be accessible to everyone.',
  },
  '/help': {
    title: 'Help Centre — Studifree',
    description:
      'Practical guides for Studifree: set up your own Gemini API key, create and study flashcards, generate quizzes, plan study sessions and understand your data.',
    indexable: true,
    path: '/help',
    socialTitle: 'Help Centre — Studifree',
    socialDescription:
      'Set up AI, study flashcards, generate quizzes and get the most out of your learning workspace.',
  },
}

const privatePageTitles: Record<string, string> = {
  '/home': 'Home — Studifree',
  '/learn': 'Learn — Studifree',
  '/practice': 'Practice — Studifree',
  '/progress': 'Progress — Studifree',
  '/library': 'Library — Studifree',
  '/planner': 'Planner — Studifree',
  '/settings': 'Settings — Studifree',
  '/ai-setup': 'AI Setup — Studifree',
  '/flashcards': 'Flashcards — Studifree',
  '/quiz': 'Quiz Studio — Studifree',
  '/onboarding': 'Welcome — Studifree',
}

/** Resolve metadata for a pathname without assuming a deployment domain. */
export function getRouteMeta(pathname: string): RouteMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const publicMeta = pageMeta[path]
  if (publicMeta) return publicMeta

  return {
    title: privatePageTitles[path] ?? 'Studifree',
    description: SITE.description,
    indexable: false,
    path,
  }
}

export const sitemapPaths = Object.values(pageMeta)
  .filter((meta) => meta.indexable && meta.path)
  .map((meta) => meta.path as string)
