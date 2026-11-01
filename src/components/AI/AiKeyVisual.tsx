import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { KeyRound } from 'lucide-react'

interface Props {
  className?: string
}

/**
 * Monochrome animated key illustration. Decorative only, so it is hidden from
 * assistive technology and calms down when reduced motion is requested.
 */
export const AiKeyVisual: React.FC<Props> = ({ className }) => {
  const reduced = useReducedMotion()

  return (
    <div className={className} aria-hidden="true">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        <div className="absolute inset-0 rounded-full bg-accent-soft blur-2xl" />

        <motion.span
          className="absolute inset-0 rounded-full border border-line"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-5 rounded-full border border-line-strong border-dashed"
          animate={reduced ? undefined : { rotate: -360 }}
          transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-9 sm:inset-10 rounded-[1.75rem] glass border border-line-strong shadow-float flex items-center justify-center"
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        >
          <KeyRound className="w-10 h-10 sm:w-12 sm:h-12 text-ink" strokeWidth={1.4} />
        </motion.div>

        <motion.span
          className="absolute top-3 right-6 w-2.5 h-2.5 rounded-full bg-accent shadow-soft"
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.span
          className="absolute bottom-5 left-4 w-1.5 h-1.5 rounded-full bg-faint"
          animate={reduced ? undefined : { opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 4.1, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
        />
      </div>
    </div>
  )
}
