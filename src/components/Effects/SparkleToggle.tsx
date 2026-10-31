import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export const SparkleToggle: React.FC<Props> = ({ checked, onChange, label, disabled }) => {
  const particles = Array.from({ length: 8 })
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative w-14 h-14 rounded-full border border-line transition-colors duration-300 focus-visible:outline-none overflow-visible',
          checked ? 'bg-accent' : 'bg-surface',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* rotating central icon */}
        <motion.div
          animate={{ rotate: checked ? 360 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className={clsx('w-6 h-6', checked ? 'text-accent-ink' : 'text-muted')} />
        </motion.div>
        {/* sparkles */}
        <AnimatePresence>
          {checked && particles.map((_, i) => {
            const angle = (i / particles.length) * Math.PI * 2
            const r = 26
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: Math.cos(angle) * r, y: Math.sin(angle) * r }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: i * 0.05, repeat: Infinity, repeatDelay: 1.2 }}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-accent-ink"
                style={{ marginLeft: -3, marginTop: -3 }}
              />
            )
          })}
        </AnimatePresence>
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  )
}
