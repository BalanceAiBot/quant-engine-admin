import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { fmtUsd, fmtBps, fmtPct, badgeClass } from '../lib/utils'

export function MarketsPage() {
  const [runtime, setRuntime] = useState<any>(null)
  const [universe, setUniverse] = useState<any>(null)
  const [features, setFeatures] = useState<any[]>([])

  usePolling(async () => {
    const [rRes, uRes, fRes] = await Promise.all([
      apiGet('/api/markets/runtime'),
      apiGet('/api/markets/universe'),
      apiGet('/api/markets/features?limit=50')
    ])
    setRuntime(rRes.data)
    setUniverse(uRes.data)
    setFeatures(fRes.data || [])
  }, 5000)

  const handleStart = async () => {
    try {
      await apiPost('/api/markets/runtime/start', { source: 'sample' })
      showToast('Runtime started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleStop = async () => {
    try {
      await apiPost('/api/markets/runtime/stop', {})
      showToast('Runtime stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const status = runtime?.status || {}

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Markets</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Market Runtime</h3>
          <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(status.state)}`}>{status.state}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={handleStart} className="px-3 py-1.5 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Start</button>
          <button onClick={handleStop} className="px-3 py-1.5 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white">Stop</button>
        </div>
        <div className="text-xs text-slate-400 mb-2">Connections ({status.connections?.length || 0})</div>
        {status.connections?.length > 0 && (
          <div className="space-y-2">
            {status.connections.map((c: any) => (
              <div key={c.connectionId} className="flex items-center justify-between text-sm border-b border-slate-800 pb-1">
                <span className="text-slate-300">{c.connectionId} • {c.instrumentKind}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${badgeClass(c.state)}`}>{c.state}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Universe</h3>
        <div className="text-xs text-slate-400 mb-2">
          Source: {universe?.source} • Pairs: {universe?.pairs?.length || 0} • Streams: {universe?.stats?.streamCount || 0}
        </div>
        <DataTable
          columns={[
            { label: 'Base', key: 'baseAsset' },
            { label: 'Spot', key: 'spotSymbol' },
            { label: 'Perp', key: 'perpetualSymbol' },
            { label: 'Volume', key: 'combinedQuoteVolume', align: 'right', render: (r: any) => fmtUsd(r.combinedQuoteVolume) }
          ]}
          rows={universe?.pairs || []}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Features</h3>
        <DataTable
          columns={[
            { label: 'Base', key: 'baseAsset' },
            { label: 'Spot', key: 'spotLastPrice', align: 'right', render: (r) => fmtUsd(r.spotLastPrice) },
            { label: 'Perp', key: 'perpetualLastPrice', align: 'right', render: (r) => fmtUsd(r.perpetualLastPrice) },
            { label: 'Mark', key: 'markPrice', align: 'right', render: (r) => fmtUsd(r.markPrice) },
            { label: 'Basis', key: 'basisBps', align: 'right', render: (r) => fmtBps(r.basisBps) },
            { label: 'Funding', key: 'fundingRate', align: 'right', render: (r) => fmtPct(r.fundingRate) }
          ]}
          rows={features}
        />
      </div>
    </div>
  )
}
