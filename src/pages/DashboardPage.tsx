import { useState } from 'react'
import { apiGet } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { KpiCard } from '../components/KpiCard'
import { DataTable } from '../components/DataTable'
import { fmtNumber, fmtUsd, fmtDateTime, badgeClass, clsForPnl } from '../lib/utils'

export function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])

  usePolling(async () => {
    const [sRes, oRes, eRes] = await Promise.all([
      apiGet('/api/system/summary'),
      apiGet('/api/orders'),
      apiGet('/api/orders/executions')
    ])
    setSummary(sRes.data)
    setOrders(oRes.data || [])
    setExecutions(eRes.data || [])
  }, 5000)

  const mode = summary?.mode || '-'
  const runtimeState = summary?.marketRuntime?.state || 'idle'
  const openOrders = orders.filter((o) => o.status === 'pending').length
  const pairCount = summary?.marketRuntime?.universePairCount || 0

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Mode" value={mode} badgeClass={badgeClass(mode)} />
        <KpiCard label="Market Runtime" value={runtimeState} badgeClass={badgeClass(runtimeState)} />
        <KpiCard label="Active Pairs" value={String(pairCount)} />
        <KpiCard label="Open Orders" value={String(openOrders)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Executions</h3>
          <DataTable
            columns={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Side', key: 'side' },
              { label: 'Qty', key: 'quantity', align: 'right', render: (r) => fmtNumber(r.quantity, 4) },
              { label: 'Fee', key: 'feePaid', align: 'right', render: (r) => fmtUsd(r.feePaid || 0) },
              { label: 'Realized PnL', key: 'realizedPnlDelta', align: 'right', render: (r) => (
                <span className={clsForPnl(r.realizedPnlDelta || 0)}>{fmtUsd(r.realizedPnlDelta || 0)}</span>
              )},
              { label: 'Time', key: 'createdAt', render: (r) => fmtDateTime(r.createdAt || r.order?.submittedAt) }
            ]}
            rows={executions.slice(0, 5).map((ex) => {
              const payload = ex.payload || ex
              const order = payload.order || {}
              return {
                symbol: order.symbol || '-',
                side: order.side || '-',
                quantity: order.quantity,
                feePaid: payload.feePaid || 0,
                realizedPnlDelta: payload.realizedPnlDelta || 0,
                createdAt: ex.createdAt,
                order
              }
            })}
            emptyText="No executions yet"
          />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">System Summary</h3>
          <pre className="text-xs text-slate-400 overflow-x-auto">{JSON.stringify(summary, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
