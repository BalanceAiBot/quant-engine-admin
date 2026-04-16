import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { PageHeader } from '../components/composite/PageHeader'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'
import { showToast } from '../components/ToastContainer'
import { fmtDateTime } from '../lib/utils'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null)
  const [filter, setFilter] = useState<string>('')
  const [ackKey, setAckKey] = useState('')
  const [activeTab, setActiveTab] = useState('alerts')

  usePolling(async () => {
    const [alRes, schRes] = await Promise.all([
      apiGet(`/api/alerts${filter ? `?status=${filter}` : ''}`),
      apiGet('/api/alerts/scheduler').catch(() => ({ data: null }))
    ])
    setAlerts(alRes.data?.alerts || [])
    setSummary(alRes.data?.summary || null)
    setSchedulerStatus(schRes.data)
  }, 5000)

  const handleScan = async () => {
    try {
      await apiPost('/api/alerts/scan', {})
      showToast('Alert scan triggered', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/alerts/acknowledge', { alertKey: ackKey })
      showToast('Alert acknowledged', 'success')
      setAckKey('')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSchedulerStart = async () => {
    try {
      await apiPost('/api/alerts/scheduler/start', {})
      showToast('Alert scheduler started', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSchedulerTick = async () => {
    try {
      await apiPost('/api/alerts/scheduler/tick', {})
      showToast('Alert scheduler ticked', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSchedulerStop = async () => {
    try {
      await apiPost('/api/alerts/scheduler/stop', {})
      showToast('Alert scheduler stopped', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="System alerts and scheduler management"
      />

      <Tabs
        tabs={[
          { id: 'alerts', label: 'Alerts', badge: summary?.open || 0 },
          { id: 'scheduler', label: 'Scheduler' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel id="alerts" activeId={activeTab}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <Card padding="compact">
              <div className="text-xs text-slate-500">Total</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{summary?.total ?? '-'}</div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Open</div>
              <div className="mt-1 text-lg font-semibold text-rose-400">{summary?.open ?? '-'}</div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Acknowledged</div>
              <div className="mt-1 text-lg font-semibold text-amber-400">{summary?.acknowledged ?? '-'}</div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Resolved</div>
              <div className="mt-1 text-lg font-semibold text-emerald-400">{summary?.resolved ?? '-'}</div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Alerts"
              action={
                <div className="flex items-center gap-2">
                  <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                  <Button variant="secondary" size="sm" onClick={handleScan}>Scan</Button>
                </div>
              }
            />
            <DataTable
              columns={[
                { key: 'alertKey', header: 'Key' },
                { key: 'scope', header: 'Scope' },
                { key: 'severity', header: 'Severity', render: (r: any) => <Badge variant={r.severity}>{r.severity}</Badge> },
                { key: 'status', header: 'Status', render: (r: any) => (
                  <span className={r.status === 'open' ? 'text-rose-400' : r.status === 'acknowledged' ? 'text-amber-400' : 'text-emerald-400'}>{r.status}</span>
                )},
                { key: 'message', header: 'Message' },
                { key: 'createdAt', header: 'Created', render: (r: any) => fmtDateTime(r.createdAt) }
              ]}
              rows={alerts}
              density="compact"
              emptyTitle="No alerts"
            />
            <form onSubmit={handleAcknowledge} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Alert key to acknowledge"
                value={ackKey}
                onChange={(e) => setAckKey(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary">Acknowledge</Button>
            </form>
          </Card>
        </TabPanel>

        <TabPanel id="scheduler" activeId={activeTab}>
          <Card>
            <CardHeader
              title="Alert Scheduler"
              action={
                <div className="flex items-center gap-2">
                  <Badge variant={schedulerStatus?.state === 'running' ? 'success' : 'default'} dot>
                    {schedulerStatus?.state || 'stopped'}
                  </Badge>
                </div>
              }
            />
            <div className="mb-4 text-sm text-slate-400">
              Tick Count: <span className="font-medium text-slate-200">{schedulerStatus?.tickCount ?? 0}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleSchedulerStart}>Start</Button>
              <Button variant="secondary" size="sm" onClick={handleSchedulerTick}>Tick</Button>
              <Button variant="danger" size="sm" onClick={handleSchedulerStop}>Stop</Button>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
