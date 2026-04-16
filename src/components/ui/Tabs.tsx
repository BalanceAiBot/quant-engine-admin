import { useState } from 'react'
import { cn } from '../../lib/utils'

interface Tab {
  id: string
  label: string
  badge?: string | number
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (id: string) => void
  children: React.ReactNode
}

export function Tabs({ tabs, defaultTab, activeTab: controlledActive, onChange, children }: TabsProps) {
  const [internalActive, setInternalActive] = useState(defaultTab || tabs[0]?.id)
  const active = controlledActive !== undefined ? controlledActive : internalActive

  const handleClick = (id: string) => {
    if (controlledActive === undefined) setInternalActive(id)
    onChange?.(id)
  }

  return (
    <div>
      <div className="border-b border-surface-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium transition-colors',
                active === tab.id ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge !== 0 && (
                <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  {tab.badge}
                </span>
              )}
              {active === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </div>
  )
}

export function TabPanel({ id, activeId, children }: { id: string; activeId: string; children: React.ReactNode }) {
  if (id !== activeId) return null
  return <div className="animate-fade-in-up">{children}</div>
}
