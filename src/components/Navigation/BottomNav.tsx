import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, Dumbbell, BarChart3, MoreHorizontal, X, Library, Calendar, HelpCircle, Info, Settings, Shield, FileText } from 'lucide-react'
import { Sheet } from '../UI/Sheet'

const primary = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
]

const moreItems = [
  { to: '/library', label: 'Library', icon: Library },
  { to: '/planner', label: 'Planner', icon: Calendar },
  { to: '/help', label: 'Help Centre', icon: HelpCircle },
  { to: '/about', label: 'About Studifree', icon: Info },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/privacy', label: 'Privacy', icon: Shield },
  { to: '/terms', label: 'Terms', icon: FileText },
]

export const BottomNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const moreActive = moreItems.some((m) => location.pathname === m.to || location.pathname.startsWith(m.to + '/'))

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed left-1/2 -translate-x-1/2 z-40 glass rounded-3xl shadow-float"
        style={{
          bottom: 'max(12px, env(safe-area-inset-bottom))',
          width: 'min(96vw, 520px)',
        }}
      >
        <ul className="flex items-center justify-between px-2 py-1.5">
          {primary.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-colors ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-1 rounded-2xl bg-accent-soft"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              onClick={() => setMoreOpen(true)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-colors w-full ${moreActive ? 'text-ink' : 'text-muted hover:text-ink'}`}
              aria-label="More"
              aria-expanded={moreOpen}
            >
              {moreActive && <span className="absolute inset-1 rounded-2xl bg-accent-soft" />}
              <MoreHorizontal className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <ul className="space-y-1">
          {moreItems.map((m) => (
            <li key={m.to}>
              <NavLink
                to={m.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-2xl transition ${isActive ? 'bg-accent-soft text-ink' : 'text-muted hover:bg-accent-soft hover:text-ink'}`
                }
              >
                <m.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{m.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}
