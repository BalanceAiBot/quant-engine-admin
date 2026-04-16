import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { badgeClass, fmtDateTime } from '../lib/utils'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null)
  const [filter, setFilter] = useState<string>('')
  const [ackKey, setAckKey] = useState('')

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
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-4">
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400">Total</div>
          <div className="text-slate-100 font-medium">{summary?.total ?? '-'}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400">Open</div>
          <div className="text-rose-400 font-medium">{summary?.open ?? '-'}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400">Acknowledged</div>
          <div className="text-amber-400 font-medium">{summary?.acknowledged ?? '-'}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400">Resolved</div>
          <div className="text-emerald-400 font-medium">{summary?.resolved ?? '-'}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Alert Scheduler</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(schedulerStatus?.state || 'stopped')}`}>
              {schedulerStatus?.state || 'stopped'}
            </span>
            <button onClick={handleSchedulerStart} className="px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white">Start</button>
            <button onClick={handleSchedulerTick} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white">Tick</button>
            <button onClick={handleSchedulerStop} className="px-3 py-1.5 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white">Stop</button>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Tick Count: {schedulerStatus?.tickCount ?? 0}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Alerts</h3>
          <div className="flex items-center gap-2">
            <select
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <button onClick={handleScan} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white">Scan</button>
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'Key', key: 'alertKey' },
            { label: 'Scope', key: 'scope' },
            { label: 'Severity', key: 'severity', render: (r) => <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(r.severity)}`}>{r.severity}</span> },
            { label: 'Status', key: 'status', render: (r) => <span className={r.status === 'open' ? 'text-rose-400' : r.status === 'acknowledged' ? 'text-amber-400' : 'text-emerald-400'}>{r.status}</span> },
            { label: 'Message', key: 'message' },
            { label: 'Created', key: 'createdAt', render: (r) => fmtDateTime(r.createdAt) }
          ]}
          rows={alerts}
          emptyText="No alerts"
        />
        <form onSubmit={handleAcknowledge} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <input
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Alert key to acknowledge"
            value={ackKey}
            onChange={(e) => setAckKey(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Acknowledge</button>
        </form>
      </div>
    </div>
  )
}
