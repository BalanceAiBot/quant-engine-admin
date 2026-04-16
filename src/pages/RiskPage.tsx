import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { PageHeader } from '../components/composite/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { showToast } from '../components/ToastContainer'

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
      <PageHeader
        title="Risk"
        description="Protections and exchange execution health"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Protections" />
          <DataTable
            columns={[
              { key: 'protectionId', header: 'Protection' },
              {
                key: 'enabled',
                header: 'Enabled',
                render: (r: any) => (
                  <Badge variant={r.enabled ? 'success' : 'danger'} dot>
                    {r.enabled ? 'Yes' : 'No'}
                  </Badge>
                )
              }
            ]}
            rows={protections}
            density="compact"
            emptyTitle="No protections"
          />
        </Card>

        <Card>
          <CardHeader
            title="Exchange Execution Health"
            action={
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="xs" onClick={() => handleReset('binance-testnet')}>Reset Testnet</Button>
                <Button variant="secondary" size="xs" onClick={() => handleReset('binance-live')}>Reset Live</Button>
                <Button variant="primary" size="xs" onClick={() => handleReset()}>Reset All</Button>
              </div>
            }
          />
          <DataTable
            columns={[
              { key: 'executionVenue', header: 'Venue' },
              {
                key: 'state',
                header: 'State',
                render: (r: any) => <Badge variant={r.state}>{r.state}</Badge>
              },
              { key: 'category', header: 'Category' },
              { key: 'reason', header: 'Reason' },
              { key: 'consecutiveRetryableFailures', header: 'Failures', align: 'right' }
            ]}
            rows={health}
            density="compact"
            emptyTitle="No health records"
          />
        </Card>
      </div>
    </div>
  )
}
