/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral monochrome tokens (CSS vars)
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        inset: 'var(--color-inset)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
          strong: 'var(--color-accent-strong)',
          ink: 'var(--color-accent-ink)',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['SFMono-Regular', 'ui-monospace', 'Menlo', 'monospace'],
        display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '2xl': '1.125rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        card: 'var(--shadow-card)',
        float: 'var(--shadow-float)',
        soft: 'var(--shadow-soft)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.45' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
