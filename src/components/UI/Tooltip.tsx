import React, { useState } from 'react'

export const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs rounded-xl bg-elevated border border-line text-ink whitespace-nowrap z-50 shadow-soft">
          {content}
        </span>
      )}
    </span>
  )
}
