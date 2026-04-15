export function fmtNumber(n: number | undefined | null, digits = 4) {
  if (n === undefined || n === null) return '-'
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  })
}

export function fmtUsd(n: number | undefined | null) {
  if (n === undefined || n === null) return '-'
  const s = Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `$${s}`
}

export function fmtBps(n: number | undefined | null) {
  if (n === undefined || n === null) return '-'
  return `${fmtNumber(n, 2)} bps`
}

export function fmtPct(n: number | undefined | null) {
  if (n === undefined || n === null) return '-'
  return `${fmtNumber(n * 100, 4)}%`
}

export function fmtTime(iso: string | undefined | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour12: false })
}

export function fmtDateTime(iso: string | undefined | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('en-US', { hour12: false })
}

export function clsForPnl(n: number | undefined | null) {
  if (n === undefined || n === null) return 'text-slate-300'
  return n >= 0 ? 'text-emerald-400' : 'text-rose-400'
}

export function clsForSide(side: string) {
  if (side === 'buy') return 'text-emerald-400'
  if (side === 'sell') return 'text-rose-400'
  return 'text-slate-300'
}

export function badgeClass(state: string) {
  const map: Record<string, string> = {
    idle: 'bg-slate-700 text-slate-200',
    starting: 'bg-amber-600/30 text-amber-400',
    running: 'bg-emerald-600/30 text-emerald-400',
    stopping: 'bg-amber-600/30 text-amber-400',
    stopped: 'bg-slate-700 text-slate-200',
    error: 'bg-rose-600/30 text-rose-400',
    open: 'bg-emerald-600/30 text-emerald-400',
    closed: 'bg-slate-700 text-slate-200',
    connecting: 'bg-amber-600/30 text-amber-400',
    reconnecting: 'bg-amber-600/30 text-amber-400',
    paper: 'bg-emerald-600/30 text-emerald-400',
    live: 'bg-rose-600/30 text-rose-400',
    readonly: 'bg-blue-600/30 text-blue-400'
  }
  return map[state] || 'bg-slate-700 text-slate-200'
}
