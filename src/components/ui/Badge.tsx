import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border-transparent',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      variantMap[variant],
      className
    )}>
      {dot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-rose-400',
          variant === 'info' && 'bg-blue-400',
          variant === 'default' && 'bg-slate-400',
        )} />
      )}
      {children}
    </span>
  )
}
