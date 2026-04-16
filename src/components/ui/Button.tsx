import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'xs' | 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
  secondary: 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-600',
  ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
}

const sizeMap: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  loading,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon}
      {children}
    </button>
  )
}
