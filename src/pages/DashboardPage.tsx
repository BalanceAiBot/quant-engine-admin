import { useState } from 'react'
import { apiGet } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { FlashValue } from '../components/ui/FlashValue'
import { PageHeader } from '../components/composite/PageHeader'
import { ModeBadge } from '../components/ui/LiveIndicator'
import { Skeleton, SkeletonCard, SkeletonTable } from '../components/ui/Skeleton'
import { fmtNumber, fmtUsd, fmtDateTime, clsForPnl, clsForSide } from '../lib/utils'

export function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  usePolling(async () => {
    const [sRes, oRes, eRes] = await Promise.all([
      apiGet('/api/system/summary'),
      apiGet('/api/orders'),
      apiGet('/api/orders/executions')
    ])
    setSummary(sRes.data)
    setOrders(oRes.data || [])
    setExecutions(eRes.data || [])
    setLoading(false)
  }, 5000)

  const mode = summary?.mode || '-'
  const runtimeState = summary?.marketRuntime?.state || 'idle'
  const openOrders = orders.filter((o) => o.status === 'pending').length
  const pairCount = summary?.marketRuntime?.universePairCount || 0

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <Skeleton className="h-4 w-32 mb-3" />
            <SkeletonTable rows={5} cols={6} />
          </Card>
          <Card>
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="System overview and recent activity"
        actions={<ModeBadge mode={mode} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card padding="compact">
          <div className="text-sm text-slate-500">Mode</div>
          <div className="mt-1 text-xl font-semibold text-slate-100">{mode}</div>
        </Card>
        <Card padding="compact">
          <div className="text-sm text-slate-500">Market Runtime</div>
          <div className="mt-1 text-xl font-semibold text-slate-100">{runtimeState}</div>
        </Card>
        <Card padding="compact">
          <div className="text-sm text-slate-500">Active Pairs</div>
          <div className="mt-1 text-xl font-semibold text-slate-100">
            <FlashValue value={pairCount}>{String(pairCount)}</FlashValue>
          </div>
        </Card>
        <Card padding="compact">
          <div className="text-sm text-slate-500">Open Orders</div>
          <div className="mt-1 text-xl font-semibold text-slate-100">
            <FlashValue value={openOrders}>{String(openOrders)}</FlashValue>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Executions" />
          <DataTable
            columns={[
              { key: 'symbol', header: 'Symbol' },
              { key: 'side', header: 'Side', render: (r: any) => <span className={clsForSide(r.side)}>{r.side}</span> },
              { key: 'quantity', header: 'Qty', align: 'right', render: (r: any) => fmtNumber(r.quantity, 4) },
              { key: 'feePaid', header: 'Fee', align: 'right', render: (r: any) => fmtUsd(r.feePaid || 0) },
              { key: 'realizedPnlDelta', header: 'Realized P&L', align: 'right', render: (r: any) => (
                <span className={clsForPnl(r.realizedPnlDelta || 0)}>{fmtUsd(r.realizedPnlDelta || 0)}</span>
              )},
              { key: 'createdAt', header: 'Time', render: (r: any) => fmtDateTime(r.createdAt || r.order?.submittedAt) }
            ]}
            rows={executions.slice(0, 5).map((ex: any) => {
              const payload = ex.payload || ex
              const order = payload.order || {}
              return {
                id: ex.id || `${order.symbol}-${ex.createdAt}`,
                symbol: order.symbol || '-',
                side: order.side || '-',
                quantity: order.quantity,
                feePaid: payload.feePaid || 0,
                realizedPnlDelta: payload.realizedPnlDelta || 0,
                createdAt: ex.createdAt,
                order
              }
            })}
            density="compact"
            emptyTitle="No executions yet"
          />
        </Card>

        <Card>
          <CardHeader title="System Health" />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-slate-950 px-4 py-3">
              <span className="text-sm text-slate-400">Market Runtime</span>
              <span className="text-sm font-medium text-slate-200">{runtimeState}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-slate-950 px-4 py-3">
              <span className="text-sm text-slate-400">Universe Pairs</span>
              <span className="text-sm font-medium text-slate-200">{pairCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-slate-950 px-4 py-3">
              <span className="text-sm text-slate-400">Pending Orders</span>
              <span className="text-sm font-medium text-slate-200">{openOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-slate-950 px-4 py-3">
              <span className="text-sm text-slate-400">Recent Executions</span>
              <span className="text-sm font-medium text-slate-200">{executions.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
