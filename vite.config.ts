import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Public pages only. Settings, API-key setup, onboarding and every in-app
 * study screen are intentionally excluded from the sitemap.
 */
const SITEMAP_PATHS = ['/', '/about', '/help']

const PRIVATE_PATHS = [
  '/home',
  '/settings',
  '/ai-setup',
  '/onboarding',
  '/learn',
  '/flashcards',
  '/quiz',
  '/practice',
  '/progress',
  '/library',
  '/planner',
]

function absolute(siteOrigin: string, path: string): string {
  return `${siteOrigin}${path}`
}

function sitemapXml(siteOrigin: string): string {
  const lastmod = new Date().toISOString().slice(0, 10)
  const note = siteOrigin
    ? ''
    : '  <!-- Set VITE_SITE_URL at build time to emit fully qualified URLs. -->\n'
  const urls = SITEMAP_PATHS.map(
    (path) =>
      `  <url>\n    <loc>${absolute(siteOrigin, path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>`,
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${note}${urls}\n</urlset>\n`
}

function robotsTxt(siteOrigin: string): string {
  const disallow = PRIVATE_PATHS.map((path) => `Disallow: ${path}`).join('\n')
  const sitemap = siteOrigin ? `\nSitemap: ${absolute(siteOrigin, '/sitemap.xml')}\n` : ''

  return [
    'User-agent: *',
    'Allow: /',
    disallow,
    '',
    '# Private application screens are also marked noindex in the document head.',
    sitemap,
  ].join('\n')
}

function seoAssets(siteOrigin: string): Plugin {
  return {
    name: 'studifree-seo-assets',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_ORIGIN__', siteOrigin)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteOrigin) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteOrigin) })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (
    env.VITE_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    ''
  ).replace(/\/+$/, '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png'],
        manifest: {
          name: 'Studifree',
          short_name: 'Studifree',
          description:
            'A free-to-start learning workspace with AI-assisted explanations, flashcards, quizzes and study planning.',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          categories: ['education', 'productivity'],
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: { enabled: false },
      }),
      seoAssets(siteOrigin),
    ],
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  }
})
