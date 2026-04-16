import { cn } from '../../lib/utils'

export function LiveIndicator({ active, label }: { active: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {active && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse-ring" />
        )}
        <span className={cn(
          'relative inline-flex rounded-full h-2.5 w-2.5',
          active ? 'bg-emerald-500' : 'bg-slate-500'
        )} />
      </span>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  )
}

export function ModeBadge({ mode }: { mode?: string }) {
  const isLive = mode === 'live'
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border',
      isLive
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    )}>
      <span className={cn('relative flex h-2 w-2', isLive ? 'animate-pulse-dot' : '')}>
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          isLive ? 'bg-rose-400' : 'bg-emerald-400'
        )} />
      </span>
      {mode?.toUpperCase() || '-'}
    </div>
  )
}
