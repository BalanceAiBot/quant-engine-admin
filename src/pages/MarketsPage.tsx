import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { PageHeader } from '../components/composite/PageHeader'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { showToast } from '../components/ToastContainer'
import { fmtUsd, fmtBps, fmtPct } from '../lib/utils'

export function MarketsPage() {
  const [runtime, setRuntime] = useState<any>(null)
  const [universe, setUniverse] = useState<any>(null)
  const [features, setFeatures] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('runtime')

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
      <PageHeader
        title="Markets"
        description="Market runtime, universe, and feature snapshots"
      />

      <Tabs
        tabs={[
          { id: 'runtime', label: 'Runtime' },
          { id: 'universe', label: 'Universe', badge: universe?.pairs?.length || 0 },
          { id: 'features', label: 'Features', badge: features.length || 0 },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel id="runtime" activeId={activeTab}>
          <Card>
            <CardHeader
              title="Market Runtime"
              action={
                <div className="flex items-center gap-2">
                  <Badge variant={status.state} dot>{status.state}</Badge>
                  <Button variant="primary" size="sm" onClick={handleStart}>Start</Button>
                  <Button variant="danger" size="sm" onClick={handleStop}>Stop</Button>
                </div>
              }
            />
            <div className="mb-2 text-sm text-slate-400">
              Connections: <span className="font-medium text-slate-200">{status.connections?.length || 0}</span>
            </div>
            {status.connections?.length > 0 && (
              <div className="space-y-2">
                {status.connections.map((c: any) => (
                  <div
                    key={c.connectionId}
                    className="flex items-center justify-between rounded-lg border border-surface-border bg-slate-950 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{c.connectionId} • {c.instrumentKind}</span>
                    <Badge variant={c.state}>{c.state}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel id="universe" activeId={activeTab}>
          <Card>
            <CardHeader
              title="Universe"
              subtitle={`Source: ${universe?.source || '-'} • Pairs: ${universe?.pairs?.length || 0} • Streams: ${universe?.stats?.streamCount || 0}`}
            />
            <DataTable
              columns={[
                { key: 'baseAsset', header: 'Base' },
                { key: 'spotSymbol', header: 'Spot' },
                { key: 'perpetualSymbol', header: 'Perp' },
                { key: 'combinedQuoteVolume', header: 'Volume', align: 'right', render: (r: any) => fmtUsd(r.combinedQuoteVolume) }
              ]}
              rows={universe?.pairs || []}
              density="compact"
              emptyTitle="No universe pairs"
            />
          </Card>
        </TabPanel>

        <TabPanel id="features" activeId={activeTab}>
          <Card>
            <CardHeader title="Features" />
            <DataTable
              columns={[
                { key: 'baseAsset', header: 'Base' },
                { key: 'spotLastPrice', header: 'Spot', align: 'right', render: (r: any) => fmtUsd(r.spotLastPrice) },
                { key: 'perpetualLastPrice', header: 'Perp', align: 'right', render: (r: any) => fmtUsd(r.perpetualLastPrice) },
                { key: 'markPrice', header: 'Mark', align: 'right', render: (r: any) => fmtUsd(r.markPrice) },
                { key: 'basisBps', header: 'Basis', align: 'right', render: (r: any) => fmtBps(r.basisBps) },
                { key: 'fundingRate', header: 'Funding', align: 'right', render: (r: any) => fmtPct(r.fundingRate) }
              ]}
              rows={features}
              density="compact"
              emptyTitle="No features"
            />
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
