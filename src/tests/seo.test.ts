import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildStructuredData } from '../hooks/useDocumentMeta'
import { getRouteMeta, SITE, sitemapPaths } from '../data/site'
import { stageLabels } from '../components/AI/generation/useGenerationMachine'

const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path))

function pngSize(path: string): { width: number; height: number } {
  const buffer = read(path)
  expect(buffer.subarray(1, 4).toString()).toBe('PNG')
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

describe('social and search metadata', () => {
  it('uses the exact public title and description in index.html', () => {
    const html = read('index.html').toString()
    expect(html).toContain('<title>Studifree — Learn Anything. Understand Everything.</title>')
    expect(html).toContain(
      'Studifree is a free-to-start learning platform with AI-powered explanations, flashcards, quizzes, study planning and progress tracking. Learn at your own pace with your own AI key.',
    )
    expect(html).toContain('name="author" content="Syed Zainul Abideen"')
    expect(html).toContain('name="robots" content="index, follow, max-image-preview:large"')
  })

  it('uses the exact social preview copy and image dimensions', () => {
    const html = read('index.html').toString()
    expect(html).toContain('Studifree — Learning Should Be for Everyone')
    expect(html).toContain(
      'Learn any subject, understand difficult concepts, create flashcards, practise with quizzes and organise your learning. Your learning space starts here.',
    )
    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:height" content="630"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
  })

  it('ships real preview and icon assets at the declared dimensions', () => {
    expect(pngSize('public/og-image.png')).toEqual({ width: 1200, height: 630 })
    expect(pngSize('public/pwa-512x512.png')).toEqual({ width: 512, height: 512 })
    expect(pngSize('public/pwa-192x192.png')).toEqual({ width: 192, height: 192 })
    expect(pngSize('public/pwa-maskable-512x512.png')).toEqual({ width: 512, height: 512 })
    expect(pngSize('public/apple-touch-icon.png')).toEqual({ width: 180, height: 180 })
    expect(pngSize('public/favicon-32x32.png')).toEqual({ width: 32, height: 32 })
    expect(pngSize('public/favicon-16x16.png')).toEqual({ width: 16, height: 16 })
  })
})

describe('canonicalisation and route metadata', () => {
  it('keeps the landing page as the primary indexable product page', () => {
    const meta = getRouteMeta('/')
    expect(meta.indexable).toBe(true)
    expect(meta.path).toBe('/')
    expect(meta.title).toBe(SITE.title)
  })

  it('marks private application screens as noindex', () => {
    for (const path of ['/home', '/settings', '/ai-setup', '/flashcards', '/quiz', '/learn', '/onboarding']) {
      expect(getRouteMeta(path).indexable).toBe(false)
    }
  })

  it('only includes public pages in the sitemap', () => {
    expect(sitemapPaths).toEqual(['/', '/about', '/help'])
    for (const path of ['/settings', '/ai-setup', '/flashcards', '/quiz', '/learn', '/onboarding']) {
      expect(sitemapPaths).not.toContain(path)
    }
  })
})

describe('structured data', () => {
  const data = buildStructuredData('https://studifree.example') as any
  const graph = data['@graph'] as any[]

  it('is valid JSON with the expected schema types', () => {
    expect(() => JSON.parse(JSON.stringify(data))).not.toThrow()
    expect(data['@context']).toBe('https://schema.org')
    expect(graph.map((node) => node['@type'])).toEqual(['WebSite', 'Person', 'SoftwareApplication'])
  })

  it('attributes the project to the real founder without inventing a company', () => {
    const person = graph.find((node) => node['@type'] === 'Person')
    expect(person.name).toBe('Syed Zainul Abideen')
    expect(person.jobTitle).toBe('Founder of Studifree')
    expect(person.url).toBe('https://studifree.example/about')
    expect(graph.some((node) => node['@type'] === 'Organization')).toBe(false)
  })

  it('does not invent ratings, reviews, offers or contact details', () => {
    const serialised = JSON.stringify(data)
    expect(serialised).not.toMatch(/aggregateRating|reviewCount|ratingValue|telephone|streetAddress|postalCode/i)
    expect(serialised).not.toMatch(/AIza[0-9A-Za-z_-]+/)
    const app = graph.find((node) => node['@type'] === 'SoftwareApplication')
    expect(app.offers.price).toBe('0')
    expect(app.offers.description).toContain('AI features require your own Google Gemini API key')
  })
})

describe('generation feedback labels', () => {
  it('names every intermediate stage without fake progress', () => {
    expect(stageLabels).toEqual({ generating: 'Generating', validating: 'Checking', saving: 'Saving' })
  })
})
