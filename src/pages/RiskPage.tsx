import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { badgeClass } from '../lib/utils'

export function RiskPage() {
  const [protections, setProtections] = useState<any[]>([])
  const [health, setHealth] = useState<any[]>([])

  usePolling(async () => {
    const [pRes, hRes] = await Promise.all([
      apiGet('/api/risk/protections'),
      apiGet('/api/risk/exchange-health')
    ])
    setProtections(pRes.data || [])
    setHealth(hRes.data || [])
  }, 5000)

  const handleReset = async (venue?: string) => {
    try {
      await apiPost('/api/risk/exchange-health/reset', venue ? { executionVenue: venue } : {})
      showToast('Exchange health reset', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
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

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Exchange Execution Health</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReset('binance-testnet')}
              className="px-3 py-1.5 rounded text-xs bg-slate-700 hover:bg-slate-600 text-white"
            >
              Reset Testnet
            </button>
            <button
              onClick={() => handleReset('binance-live')}
              className="px-3 py-1.5 rounded text-xs bg-slate-700 hover:bg-slate-600 text-white"
            >
              Reset Live
            </button>
            <button
              onClick={() => handleReset()}
              className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
            >
              Reset All
            </button>
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'Venue', key: 'executionVenue' },
            {
              label: 'State',
              key: 'state',
              render: (r) => (
                <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(r.state)}`}>{r.state}</span>
              )
            },
            { label: 'Category', key: 'category' },
            { label: 'Reason', key: 'reason' },
            { label: 'Failures', key: 'consecutiveRetryableFailures', align: 'right' }
          ]}
          rows={health}
        />
      </div>
    </div>
  )
}
