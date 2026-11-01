import React, { useState } from 'react'
import { clsx } from 'clsx'

interface Tab { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }

interface Props {
  tabs: Tab[]
  value?: string
  onChange?: (id: string) => void
  children?: (active: string) => React.ReactNode
}

export const Tabs: React.FC<Props> = ({ tabs, value, onChange, children }) => {
  const [internal, setInternal] = useState(tabs[0]?.id)
  const active = value ?? internal
  const setActive = (id: string) => { setInternal(id); onChange?.(id) }
  return (
    <div>
      <div className="flex gap-1 p-1 rounded-2xl bg-inset border border-line w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong',
              active === t.id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            {t.icon && <t.icon className="w-4 h-4" />}
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{children?.(active)}</div>
    </div>
  )
}
