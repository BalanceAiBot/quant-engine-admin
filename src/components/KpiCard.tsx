interface KpiCardProps {
  label: string
  value: string
  badgeClass?: string
}

export function KpiCard({ label, value, badgeClass }: KpiCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="text-slate-400 text-sm mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-100">
        {badgeClass ? (
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${badgeClass}`}>{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
