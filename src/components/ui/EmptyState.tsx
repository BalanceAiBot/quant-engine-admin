import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
        <Inbox className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-slate-300">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
