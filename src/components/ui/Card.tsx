import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'compact' | 'default' | 'loose'
}

export function Card({ children, className, padding = 'default' }: CardProps) {
  const paddingMap = {
    none: '',
    compact: 'p-4',
    default: 'p-5',
    loose: 'p-6'
  }

  return (
    <div className={cn(
      'rounded-xl border border-surface-border bg-surface-elevated',
      paddingMap[padding],
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  action,
  subtitle
}: {
  title: string
  action?: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
