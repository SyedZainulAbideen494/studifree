/** Official Google resources used across AI setup, help and empty states. */
export const aiLinks = {
  studio: 'https://aistudio.google.com/',
  apiKey: 'https://aistudio.google.com/app/apikey',
  docs: 'https://ai.google.dev/gemini-api/docs',
  models: 'https://ai.google.dev/gemini-api/docs/models',
  pricing: 'https://ai.google.dev/gemini-api/docs/pricing',
} as const

export interface AiResourceLink {
  title: string
  description: string
  href: string
}

export const aiResourceLinks: AiResourceLink[] = [
  {
    title: 'Google AI Studio',
    description: 'The official home for creating and managing your Gemini API key.',
    href: aiLinks.studio,
  },
  {
    title: 'Create a Gemini API key',
    description: 'Open the key page directly, sign in and generate your key.',
    href: aiLinks.apiKey,
  },
  {
    title: 'Gemini API documentation',
    description: 'A plain overview of how the Gemini API works and what it can do.',
    href: aiLinks.docs,
  },
  {
    title: 'Gemini models',
    description: 'See which models are currently available, including free-tier eligibility.',
    href: aiLinks.models,
  },
  {
    title: 'Gemini pricing',
    description: 'Check Google’s current pricing, quotas and free-tier details before you start.',
    href: aiLinks.pricing,
  },
]
