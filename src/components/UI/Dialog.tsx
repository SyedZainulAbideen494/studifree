import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const Dialog: React.FC<Props> = ({ open, onClose, title, children, className }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className={clsx('relative z-10 w-full max-w-lg rounded-3xl bg-surface border border-line shadow-float p-6', className)}
        >
          <div className="flex items-center justify-between mb-4">
            {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
            <button onClick={onClose} className="ml-auto p-1.5 rounded-xl hover:bg-accent-soft text-muted" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
