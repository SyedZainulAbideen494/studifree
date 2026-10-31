import React from 'react'
import { clsx } from 'clsx'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  padded?: boolean
}

export const Card: React.FC<Props> = ({ glass, padded = true, className, children, ...rest }) => (
  <div
    className={clsx(
      'rounded-3xl border border-line',
      glass ? 'glass' : 'bg-surface',
      padded && 'p-5',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
)
