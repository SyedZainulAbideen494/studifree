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
 * project. The free offer describes only the local core tools; AI usage is
 * subject to the learner's own provider key and that provider's limits.
 */
export function buildStructuredData(origin: string) {
  const siteRoot = `${origin}/`
  const appId = `${origin}/#software`
  const websiteId = `${origin}/#website`

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
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: SITE.name,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web browser',
        description:
          'A learning platform with AI-assisted explanations, flashcards, quizzes, study planning and progress tracking.',
        url: siteRoot,
        isAccessibleForFree: true,
        inLanguage: SITE.language,
        featureList: [
          'AI-assisted explanations',
          'Spaced-repetition flashcards',
          'Generated practice quizzes',
          'Study planner and focus timer',
          'Local progress tracking',
          'Bring-your-own Gemini API key',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description:
            'Core manual study tools are free to use. AI features require your own Google Gemini API key and may be subject to separate provider quotas or charges.',
        },
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
    setMeta('name', 'author', SITE.name)
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
