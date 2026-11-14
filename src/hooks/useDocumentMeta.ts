import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta, SITE } from '../data/site'

type Attr = 'name' | 'property'

function setMeta(attr: Attr, key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeMeta(attr: Attr, key: string): void {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function setCanonical(href: string | null): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function absolute(path: string): string {
  return `${window.location.origin}${path}`
}

/**
 * Build a conservative schema.org graph for the public product.
 *
 * There is deliberately no Organization, aggregateRating, review, address or
 * contact point: none of those details are verified for this independent
 * project. The founder is modelled as a Person and referenced as the author,
 * creator and publisher. The free offer describes only the local core tools;
 * AI usage is subject to the learner's own provider key and that provider's
 * limits.
 */
export function buildStructuredData(origin: string) {
  const siteRoot = `${origin}/`
  const appId = `${origin}/#software`
  const websiteId = `${origin}/#website`
  const founderId = `${origin}/#founder`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteRoot,
        name: SITE.name,
        description: SITE.description,
        inLanguage: SITE.language,
        publisher: { '@id': founderId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: SITE.name,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description:
          'A modern AI-powered study companion for notes, flashcards, quizzes and revision, with optional AI features that use your own supported API key.',
        url: siteRoot,
        isAccessibleForFree: true,
        inLanguage: SITE.language,
        author: { '@id': founderId },
        creator: { '@id': founderId },
        featureList: [
          'AI-assisted explanations',
          'AI-generated notes and flashcards',
          'Quiz generation and practice',
          'Flashcard study mode',
          'Study and revision tools',
          'Local-first study data',
          'Bring-your-own AI API key',
          'Automatic AI model fallback when supported',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description:
            'The core study tools are free to use. AI features require your own supported AI API key; usage, quotas and pricing depend on your AI provider and account.',
        },
      },
      {
        '@type': 'Person',
        '@id': founderId,
        name: SITE.author,
        jobTitle: 'Founder',
        description: 'Founder of Studifree.',
        url: `${origin}/about`,
      },
    ],
  }
}

function applyStructuredData(): void {
  const json = JSON.stringify(buildStructuredData(window.location.origin))
  let script = document.getElementById('studifree-structured-data') as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = 'studifree-structured-data'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = json
}

/**
 * Keep the document head consistent as the single-page app changes route.
 * Public pages are indexable and canonicalised to themselves. Application
 * screens remain usable but are explicitly excluded from search results.
 */
export function useDocumentMeta(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getRouteMeta(pathname)
    const canonical = meta.path ? absolute(meta.path) : null
    const socialTitle = meta.socialTitle ?? meta.title
    const socialDescription = meta.socialDescription ?? meta.description
    const image = absolute(SITE.socialImage)

    document.title = meta.title
    document.documentElement.lang = SITE.language

    setMeta('name', 'description', meta.description)
    setMeta('name', 'author', SITE.author)
    setMeta('name', 'creator', SITE.author)
    setMeta('name', 'theme-color', SITE.themeColor)
    setMeta('name', 'robots', meta.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')
    setMeta('name', 'googlebot', meta.indexable ? 'index, follow' : 'noindex, nofollow')

    if (meta.indexable) setCanonical(canonical)
    else setCanonical(null)

    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE.name)
    setMeta('property', 'og:locale', SITE.locale)
    setMeta('property', 'og:title', socialTitle)
    setMeta('property', 'og:description', socialDescription)
    setMeta('property', 'og:url', canonical ?? absolute(pathname))
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:image:width', String(SITE.socialImageWidth))
    setMeta('property', 'og:image:height', String(SITE.socialImageHeight))
    setMeta('property', 'og:image:alt', SITE.socialImageAlt)

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', socialTitle)
    setMeta('name', 'twitter:description', socialDescription)
    setMeta('name', 'twitter:image', image)
    setMeta('name', 'twitter:image:alt', SITE.socialImageAlt)

    if (!meta.indexable) {
      // A private screen should not surface a stale landing canonical.
      removeMeta('name', 'keywords')
    } else {
      setMeta('name', 'keywords', SITE.keywords.join(', '))
    }

    applyStructuredData()
  }, [pathname])
}
