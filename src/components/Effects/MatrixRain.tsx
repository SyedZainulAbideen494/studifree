import React, { useEffect, useRef } from 'react'

interface Props {
  className?: string
  density?: number
  opacity?: number
}

export const MatrixRain: React.FC<Props> = ({ className = '', density = 0.6, opacity = 0.35 }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let cols: number[] = []
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const fontSize = 14

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
      const w = canvas.offsetWidth
      const n = Math.floor(w / fontSize)
      cols = Array.from({ length: n }, () => Math.random() * (canvas.offsetHeight / fontSize))
    }
    resize()
    window.addEventListener('resize', resize)

    if (reduced) {
      // static fallback
      ctx.fillStyle = `rgba(255,255,255,${opacity * 0.2})`
      ctx.font = `${fontSize}px monospace`
      return () => window.removeEventListener('resize', resize)
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.fillStyle = 'rgba(5,5,5,0.08)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < cols.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = cols[i] * fontSize
        ctx.fillStyle = Math.random() > 0.95 ? `rgba(255,255,255,${opacity})` : `rgba(176,176,176,${opacity * 0.7})`
        ctx.fillText(ch, x, y)
        if (y > h && Math.random() > 1 - density * 0.05) cols[i] = 0
        cols[i] += 0.6 + Math.random() * 0.6
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density, opacity])

  return <canvas ref={ref} className={`block w-full h-full ${className}`} aria-hidden="true" />
}
