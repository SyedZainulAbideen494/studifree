import React from 'react'

interface Props { value: number; max?: number; className?: string; label?: string }

export const Progress: React.FC<Props> = ({ value, max = 100, className = '', label }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={className}>
      {label && <div className="flex justify-between text-xs text-muted mb-1.5"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className="h-2 rounded-full bg-inset overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
