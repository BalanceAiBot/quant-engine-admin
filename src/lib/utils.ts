import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
    idle: 'bg-slate-800 text-slate-300',
    starting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    stopping: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    stopped: 'bg-slate-800 text-slate-300',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    open: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    closed: 'bg-slate-800 text-slate-300',
    connecting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reconnecting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    paper: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    live: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    readonly: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    default: 'bg-slate-800 text-slate-300'
  }
  return map[state] || map.default
}
