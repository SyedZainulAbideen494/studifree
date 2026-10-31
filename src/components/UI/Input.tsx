import React from 'react'
import { clsx } from 'clsx'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input: React.FC<Props> = ({ label, hint, error, className, ...rest }) => (
  <label className="block">
    {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
    <input
      className={clsx(
        'w-full px-4 py-2.5 rounded-2xl bg-surface border border-line text-ink placeholder:text-faint focus:outline-none focus:border-line-strong transition',
        error && 'border-line-strong',
        className,
      )}
      {...rest}
    />
    {hint && !error && <span className="block text-xs text-faint mt-1.5">{hint}</span>}
    {error && <span className="block text-xs text-ink mt-1.5">{error}</span>}
  </label>
)

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string }> = ({ label, hint, error, className, ...rest }) => (
  <label className="block">
    {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
    <textarea
      className={clsx(
        'w-full px-4 py-2.5 rounded-2xl bg-surface border border-line text-ink placeholder:text-faint focus:outline-none focus:border-line-strong transition resize-y min-h-[100px]',
        error && 'border-line-strong',
        className,
      )}
      {...rest}
    />
    {hint && !error && <span className="block text-xs text-faint mt-1.5">{hint}</span>}
    {error && <span className="block text-xs text-ink mt-1.5">{error}</span>}
  </label>
)
