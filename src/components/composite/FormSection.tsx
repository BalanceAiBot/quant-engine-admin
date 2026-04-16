import { cn } from '../../lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  )
}
