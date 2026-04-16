import { cn } from '../../lib/utils'

export const inputBaseClass = cn(
  'w-full rounded-lg border border-surface-border bg-slate-950 px-3 py-2 text-sm text-slate-100',
  'placeholder:text-slate-600',
  'focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-700',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-all duration-150 hover:border-slate-700'
)

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBaseClass, className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBaseClass, className)} {...props}>
      {children}
    </select>
  )
}

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-400">
      {children}
      {required && <span className="ml-0.5 text-rose-400">*</span>}
    </label>
  )
}
