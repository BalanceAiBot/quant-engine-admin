import { useState } from 'react'
import { apiGet } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'

export function RiskPage() {
  const [protections, setProtections] = useState<any[]>([])

  usePolling(async () => {
    const res = await apiGet('/api/risk/protections')
    setProtections(res.data || [])
  }, 5000)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Protections</h3>
        <DataTable
          columns={[
            { label: 'Protection', key: 'protectionId' },
            {
              label: 'Enabled',
              key: 'enabled',
              render: (r) => (
                <span className={r.enabled ? 'text-emerald-400' : 'text-rose-400'}>
                  {r.enabled ? 'Yes' : 'No'}
                </span>
              )
            }
          ]}
          rows={protections}
        />
      </div>
    </div>
  )
}
