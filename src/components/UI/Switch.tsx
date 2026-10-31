import React from 'react'
import { clsx } from 'clsx'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
}

export const Switch: React.FC<Props> = ({ checked, onChange, label, id, disabled }) => {
  const sid = id || `sw-${Math.random().toString(36).slice(2)}`
  return (
    <label htmlFor={sid} className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        id={sid}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none',
          checked ? 'bg-accent' : 'bg-inset border border-line',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200',
            checked ? 'translate-x-5 bg-accent-ink' : 'translate-x-0 bg-ink',
          )}
        />
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  )
}
