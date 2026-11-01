import { useEffect } from 'react'
import { landingMeta } from '../data/landing'

interface MetaDefinition {
  attr: 'name' | 'property'
  key: string
  content: string
}

const metaDefinitions: MetaDefinition[] = [
  { attr: 'name', key: 'description', content: landingMeta.description },
  { attr: 'name', key: 'theme-color', content: landingMeta.themeColor },
  { attr: 'property', key: 'og:type', content: 'website' },
  { attr: 'property', key: 'og:site_name', content: 'Studifree' },
  { attr: 'property', key: 'og:title', content: landingMeta.title },
  { attr: 'property', key: 'og:description', content: landingMeta.description },
  { attr: 'name', key: 'twitter:card', content: 'summary' },
  { attr: 'name', key: 'twitter:title', content: landingMeta.title },
  { attr: 'name', key: 'twitter:description', content: landingMeta.description },
]

function applyMeta(definition: MetaDefinition, content: string): () => void {
  const selector = `meta[${definition.attr}="${definition.key}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)

  if (!existing) {
    const element = document.createElement('meta')
    element.setAttribute(definition.attr, definition.key)
    element.setAttribute('content', content)
    document.head.appendChild(element)
    return () => element.remove()
  }

  const previous = existing.getAttribute('content')
  existing.setAttribute('content', content)
  return () => {
    if (previous === null) existing.removeAttribute('content')
    else existing.setAttribute('content', previous)
  }
}

function currentCanonicalUrl(): string {
  const { origin, pathname } = window.location
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return `${origin}${path}`
}

/**
 * Derive the canonical and social URLs from the live origin. No deployment
 * domain is assumed, and the page never links to an asset that does not exist.
 */
export function useLandingMeta(): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = landingMeta.title

    const canonicalUrl = currentCanonicalUrl()
    const cleanups: Array<() => void> = []

    for (const definition of metaDefinitions) {
      cleanups.push(applyMeta(definition, definition.content))
    }

    cleanups.push(applyMeta({ attr: 'property', key: 'og:url', content: canonicalUrl }, canonicalUrl))

    const canonicalSelector = 'link[rel="canonical"]'
    const existingCanonical = document.head.querySelector<HTMLLinkElement>(canonicalSelector)
    let canonicalCleanup: () => void

    if (existingCanonical) {
      const previousHref = existingCanonical.getAttribute('href')
      existingCanonical.setAttribute('href', canonicalUrl)
      canonicalCleanup = () => {
        if (previousHref === null) existingCanonical.removeAttribute('href')
        else existingCanonical.setAttribute('href', previousHref)
      }
    } else {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = canonicalUrl
      document.head.appendChild(link)
      canonicalCleanup = () => link.remove()
    }
    cleanups.push(canonicalCleanup)

    return () => {
      for (const cleanup of cleanups.reverse()) cleanup()
      document.title = previousTitle
    }
  }, [])
}
