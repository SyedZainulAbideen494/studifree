import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, CheckCircle2, AlertTriangle, XCircle, X, ChevronDown } from 'lucide-react'
import { useAiEventsStore, Notice } from '../../store/useAiEventsStore'

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

function Toast({ n }: { n: Notice }) {
  const [showTech, setShowTech] = useState(false)
  const dismiss = useAiEventsStore((s) => s.dismissNotice)
  const Icon = icons[n.kind]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="w-full max-w-sm rounded-2xl glass border border-line shadow-float p-3.5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 text-ink mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">{n.title}</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.message}</p>
          {n.technical && (
            <div className="mt-1.5">
              <button onClick={() => setShowTech((v) => !v)} className="text-[11px] text-faint inline-flex items-center gap-1">
                Technical detail <ChevronDown className={`w-3 h-3 transition ${showTech ? 'rotate-180' : ''}`} />
              </button>
              {showTech && <pre className="mt-1 text-[10px] text-faint whitespace-pre-wrap break-words max-h-24 overflow-auto">{n.technical}</pre>}
            </div>
          )}
        </div>
        <button onClick={() => dismiss(n.id)} className="p-1 rounded-lg hover:bg-accent-soft text-faint" aria-label="Dismiss">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

export const Toasts: React.FC = () => {
  const notices = useAiEventsStore((s) => s.notices)
  return (
    <div className="fixed z-[60] left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center px-4 w-full pointer-events-none" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 92px)' }}>
      <AnimatePresence>
        {notices.map((n) => <div key={n.id} className="pointer-events-auto w-full flex justify-center"><Toast n={n} /></div>)}
      </AnimatePresence>
    </div>
  )
}
