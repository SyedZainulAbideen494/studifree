import React from 'react'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted" />
      </div>
    )}
    <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-muted max-w-sm mb-4">{description}</p>}
    {action}
  </div>
)
