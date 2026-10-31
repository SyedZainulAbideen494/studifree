import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  side?: 'bottom' | 'right'
}

export const Sheet: React.FC<Props> = ({ open, onClose, title, children, side = 'bottom' }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={side === 'bottom' ? { y: '100%' } : { x: '100%' }}
          animate={side === 'bottom' ? { y: 0 } : { x: 0 }}
          exit={side === 'bottom' ? { y: '100%' } : { x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`absolute ${side === 'bottom' ? 'bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh]' : 'top-0 right-0 bottom-0 w-full max-w-md'} bg-surface border border-line shadow-float overflow-y-auto`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
              <button onClick={onClose} className="ml-auto p-1.5 rounded-xl hover:bg-accent-soft text-muted" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
