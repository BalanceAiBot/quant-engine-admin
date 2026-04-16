import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

export function Drawer({ open, onClose, title, description, children, footer, width = 'md' }: DrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  const widthClass = {
    sm: 'w-96',
    md: 'w-[28rem]',
    lg: 'w-[36rem]',
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={cn(
        'absolute right-0 top-0 h-full bg-surface-elevated border-l border-surface-border shadow-2xl',
        'flex flex-col animate-slide-in-right',
        widthClass[width]
      )}>
        <div className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <Button variant="ghost" size="xs" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-surface-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
