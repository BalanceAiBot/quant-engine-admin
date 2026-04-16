import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { showToast } from '../components/ToastContainer'
import { PageHeader } from '../components/composite/PageHeader'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { LoadingButton } from '../components/ui/LoadingButton'
import { Drawer } from '../components/ui/Drawer'
import { Input, Select, Label } from '../components/ui/Input'
import { FormSection } from '../components/composite/FormSection'
import { Badge } from '../components/ui/Badge'
import { fmtNumber, fmtDateTime } from '../lib/utils'

export function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [presets, setPresets] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [runtimeStatuses, setRuntimeStatuses] = useState<any[]>([])
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null)
  const [optimizationStatus, setOptimizationStatus] = useState<any>(null)
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [latestEvaluations, setLatestEvaluations] = useState<any[]>([])
  const [governanceStatuses, setGovernanceStatuses] = useState<any[]>([])
  const [healthStatuses, setHealthStatuses] = useState<any[]>([])
  const [governanceScheduler, setGovernanceScheduler] = useState<any>(null)
  const [governanceActions, setGovernanceActions] = useState<any[]>([])
  const [operatorActions, setOperatorActions] = useState<any[]>([])
  const [livePromotions, setLivePromotions] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('overview')

  // drawer states
  const [backtestOpen, setBacktestOpen] = useState(false)
  const [optimizeOpen, setOptimizeOpen] = useState(false)
  const [walkForwardOpen, setWalkForwardOpen] = useState(false)
  const [rtOptOpen, setRtOptOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)

  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const fetchLivePromotion = async (strategyId: string) => {
    try {
      const res = await apiGet(`/api/strategies/governance/${strategyId}/live-promotion`)
      setLivePromotions((prev) => ({ ...prev, [strategyId]: res.data }))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    apiGet('/api/strategies').then((res) => {
      const list = res.data.strategies || []
      setStrategies(list)
      setPresets(res.data.presets || [])
      list.forEach((s: any) => fetchLivePromotion(s.id))
    })
  }, [])

  usePolling(async () => {
    const [
      rtRes, schRes, optRes, evRes, leRes,
      govRes, healthRes, govSchRes, govActRes, opActRes
    ] = await Promise.all([
      apiGet('/api/strategies/runtime/status'),
      apiGet('/api/strategies/runtime/scheduler'),
      apiGet('/api/strategies/runtime/optimization'),
      apiGet('/api/strategy-evaluations'),
      apiGet('/api/strategy-evaluations/latest'),
      apiGet('/api/strategies/governance'),
      apiGet('/api/strategies/health'),
      apiGet('/api/strategies/governance/scheduler'),
      apiGet('/api/strategies/governance/actions?limit=20'),
      apiGet('/api/strategies/governance/operator-actions?limit=20')
    ])
    setRuntimeStatuses(rtRes.data || [])
    setSchedulerStatus(schRes.data)
    setOptimizationStatus(optRes.data)
    setEvaluations(evRes.data || [])
    setLatestEvaluations(leRes.data || [])
    setGovernanceStatuses(govRes.data || [])
    setHealthStatuses(healthRes.data || [])
    setGovernanceScheduler(govSchRes.data)
    setGovernanceActions(govActRes.data || [])
    setOperatorActions(opActRes.data || [])
  }, 5000)

  const withLoading = async (key: string, fn: () => Promise<void>) => {
    setLoadingAction(key)
    try { await fn() } finally { setLoadingAction(null) }
  }

  const handleRuntimeStart = async (strategyId: string) => {
    await withLoading(`start-${strategyId}`, async () => {
      await apiPost('/api/strategies/runtime/start', { strategyId })
      showToast('Runtime started', 'success')
    })
  }

  const handleRuntimeStop = async (strategyId: string) => {
    await withLoading(`stop-${strategyId}`, async () => {
      await apiPost('/api/strategies/runtime/stop', { strategyId })
      showToast('Runtime stopped', 'success')
    })
  }

  const handleRuntimeTick = async (strategyId: string) => {
    await withLoading(`tick-${strategyId}`, async () => {
      await apiPost('/api/strategies/runtime/tick', { strategyId })
      showToast('Runtime ticked', 'success')
    })
  }

  const handleRuntimePause = async (strategyId: string) => {
    await withLoading(`pause-${strategyId}`, async () => {
      await apiPost('/api/strategies/runtime/pause', { strategyId })
      showToast('Runtime paused', 'success')
    })
  }

  const handleSchedulerStart = async () => {
    await withLoading('sch-start', async () => {
      await apiPost('/api/strategies/runtime/scheduler/start', {})
      showToast('Scheduler started', 'success')
    })
  }

  const handleSchedulerStop = async () => {
    await withLoading('sch-stop', async () => {
      await apiPost('/api/strategies/runtime/scheduler/stop', {})
      showToast('Scheduler stopped', 'success')
    })
  }

  const handleSchedulerTick = async () => {
    await withLoading('sch-tick', async () => {
      await apiPost('/api/strategies/runtime/scheduler/tick', {})
      showToast('Scheduler ticked', 'success')
    })
  }

  const handleOptSchedulerStart = async () => {
    await withLoading('opt-start', async () => {
      await apiPost('/api/strategies/runtime/optimization/scheduler/start', {})
      showToast('Optimization scheduler started', 'success')
    })
  }

  const handleOptSchedulerStop = async () => {
    await withLoading('opt-stop', async () => {
      await apiPost('/api/strategies/runtime/optimization/scheduler/stop', {})
      showToast('Optimization scheduler stopped', 'success')
    })
  }

  const handleOptSchedulerTick = async () => {
    await withLoading('opt-tick', async () => {
      await apiPost('/api/strategies/runtime/optimization/scheduler/tick', {})
      showToast('Optimization scheduler ticked', 'success')
    })
  }

  const handleGovSchedulerStart = async () => {
    await withLoading('gov-start', async () => {
      await apiPost('/api/strategies/governance/scheduler/start', {})
      showToast('Governance scheduler started', 'success')
    })
  }

  const handleGovSchedulerStop = async () => {
    await withLoading('gov-stop', async () => {
      await apiPost('/api/strategies/governance/scheduler/stop', {})
      showToast('Governance scheduler stopped', 'success')
    })
  }

  const handleGovSchedulerTick = async () => {
    await withLoading('gov-tick', async () => {
      await apiPost('/api/strategies/governance/scheduler/tick', {})
      showToast('Governance scheduler ticked', 'success')
    })
  }

  const removePolicy = async (strategyId: string, symbol: string) => {
    await withLoading(`policy-${strategyId}`, async () => {
      await apiPost('/api/strategies/runtime/optimization/policies/remove', { strategyId, symbol })
      showToast('Policy removed', 'success')
    })
  }

  const applyOperatorAction = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    await withLoading('op-action', async () => {
      await apiPost('/api/strategies/governance/operator-actions', {
        strategyId: data.get('strategyId'),
        action: data.get('action'),
        note: data.get('note') || undefined
      })
      showToast('Operator action applied', 'success')
      form.reset()
    })
  }

  return (
    <div>
      <PageHeader
        title="Strategies"
        description="Manage strategy runtime, research, and governance"
      />

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'research', label: 'Research' },
          { id: 'runtime', label: 'Runtime', badge: runtimeStatuses.length },
          { id: 'governance', label: 'Governance' },
          { id: 'evaluations', label: 'Evaluations' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel id="overview" activeId={activeTab}>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Strategies & Presets" />
              <DataTable
                columns={[
                  { key: 'id', header: 'ID' },
                  { key: 'name', header: 'Name' },
                  { key: 'description', header: 'Description' },
                  {
                    key: 'livePromotion',
                    header: 'Live Promo',
                    render: (r: any) => {
                      const promo = livePromotions[r.id]
                      if (!promo) return <span className="text-slate-500">-</span>
                      return (
                        <Badge variant={promo.approved ? 'success' : promo.pending ? 'warning' : 'default'} size="sm">
                          {promo.approved ? 'Approved' : promo.pending ? 'Pending' : 'Not Ready'}
                        </Badge>
                      )
                    }
                  }
                ]}
                rows={strategies}
                density="compact"
                emptyTitle="No strategies"
              />
              {presets.length > 0 && (
                <>
                  <div className="mt-4 text-sm font-medium text-slate-300">Presets</div>
                  <DataTable
                    columns={[
                      { key: 'id', header: 'ID' },
                      { key: 'strategyId', header: 'Strategy' },
                      { key: 'parameters', header: 'Params', render: (r: any) => JSON.stringify(r.parameters) }
                    ]}
                    rows={presets}
                    density="compact"
                  />
                </>
              )}
            </Card>

            <Card>
              <CardHeader title="Runtime Status" />
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  {
                    key: 'state',
                    header: 'State',
                    render: (r: any) => <Badge variant={stateToBadge(r.state)} size="sm" dot>{r.state}</Badge>
                  },
                  { key: 'mode', header: 'Mode' },
                  { key: 'tickCount', header: 'Ticks', align: 'right' },
                  { key: 'signalCount', header: 'Signals', align: 'right' },
                  { key: 'executionCount', header: 'Execs', align: 'right' },
                ]}
                rows={runtimeStatuses}
                density="compact"
                emptyTitle="No runtime instances"
                rowActions={(r: any) => (
                  <div className="flex items-center gap-1">
                    <Button size="xs" onClick={() => handleRuntimeStart(r.strategyId)} loading={loadingAction === `start-${r.strategyId}`}>Start</Button>
                    <Button size="xs" variant="secondary" onClick={() => handleRuntimeTick(r.strategyId)} loading={loadingAction === `tick-${r.strategyId}`}>Tick</Button>
                    <Button size="xs" variant="secondary" onClick={() => handleRuntimePause(r.strategyId)} loading={loadingAction === `pause-${r.strategyId}`}>Pause</Button>
                    <Button size="xs" variant="danger" onClick={() => handleRuntimeStop(r.strategyId)} loading={loadingAction === `stop-${r.strategyId}`}>Stop</Button>
                  </div>
                )}
              />
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="research" activeId={activeTab}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard title="Backtest" description="Run backtest with historical data" action={<Button onClick={() => setBacktestOpen(true)}>New Backtest</Button>} />
            <ActionCard title="Optimize" description="Find optimal parameter combinations" action={<Button variant="secondary" onClick={() => setOptimizeOpen(true)}>Optimize</Button>} />
            <ActionCard title="Walk-Forward" description="Validate parameter robustness" action={<Button variant="secondary" onClick={() => setWalkForwardOpen(true)}>Validate</Button>} />
          </div>
          {result && (
            <Card className="mt-4">
              <CardHeader title="Latest Result" />
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-400">{JSON.stringify(result, null, 2)}</pre>
            </Card>
          )}
        </TabPanel>

        <TabPanel id="runtime" activeId={activeTab}>
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Runtime Scheduler"
                action={
                  <div className="flex items-center gap-2">
                    <Badge variant={stateToBadge(schedulerStatus?.state || 'stopped')} size="sm" dot>{schedulerStatus?.state || 'stopped'}</Badge>
                    <Button size="xs" onClick={handleSchedulerStart} loading={loadingAction === 'sch-start'}>Start</Button>
                    <Button size="xs" variant="secondary" onClick={handleSchedulerTick} loading={loadingAction === 'sch-tick'}>Tick</Button>
                    <Button size="xs" variant="danger" onClick={handleSchedulerStop} loading={loadingAction === 'sch-stop'}>Stop</Button>
                  </div>
                }
              />
              <div className="text-sm text-slate-400">Tick Count: {schedulerStatus?.tickCount ?? 0} | Executions: {schedulerStatus?.executionCount ?? 0}</div>
            </Card>

            <Card>
              <CardHeader
                title="Optimization Scheduler"
                action={
                  <div className="flex items-center gap-2">
                    <Badge variant={stateToBadge(optimizationStatus?.scheduler?.state || 'stopped')} size="sm" dot>{optimizationStatus?.scheduler?.state || 'stopped'}</Badge>
                    <Button size="xs" onClick={handleOptSchedulerStart} loading={loadingAction === 'opt-start'}>Start</Button>
                    <Button size="xs" variant="secondary" onClick={handleOptSchedulerTick} loading={loadingAction === 'opt-tick'}>Tick</Button>
                    <Button size="xs" variant="danger" onClick={handleOptSchedulerStop} loading={loadingAction === 'opt-stop'}>Stop</Button>
                  </div>
                }
              />
              <div className="text-sm text-slate-400 mb-3">Tick Count: {optimizationStatus?.scheduler?.tickCount ?? 0}</div>
              <div className="text-sm font-medium text-slate-300 mb-2">Policies</div>
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'symbol', header: 'Symbol' },
                  { key: 'objective', header: 'Objective' },
                  { key: 'applyToRuntime', header: 'Apply', render: (r: any) => r.applyToRuntime ? 'Yes' : 'No' },
                ]}
                rows={optimizationStatus?.policies || []}
                density="compact"
                emptyTitle="No policies"
                rowActions={(r: any) => (
                  <Button size="xs" variant="danger" onClick={() => removePolicy(r.strategyId, r.symbol)} loading={loadingAction === `policy-${r.strategyId}`}>Remove</Button>
                )}
              />
              <div className="mt-3">
                <Button variant="secondary" onClick={() => setRtOptOpen(true)}>Runtime Optimize</Button>
                <Button className="ml-2" onClick={() => setPolicyOpen(true)}>Upsert Policy</Button>
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="governance" activeId={activeTab}>
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Governance Scheduler"
                action={
                  <div className="flex items-center gap-2">
                    <Badge variant={stateToBadge(governanceScheduler?.state || 'stopped')} size="sm" dot>{governanceScheduler?.state || 'stopped'}</Badge>
                    <Button size="xs" onClick={handleGovSchedulerStart} loading={loadingAction === 'gov-start'}>Start</Button>
                    <Button size="xs" variant="secondary" onClick={handleGovSchedulerTick} loading={loadingAction === 'gov-tick'}>Tick</Button>
                    <Button size="xs" variant="danger" onClick={handleGovSchedulerStop} loading={loadingAction === 'gov-stop'}>Stop</Button>
                  </div>
                }
              />
              <div className="text-sm text-slate-400 mb-3">Tick Count: {governanceScheduler?.tickCount ?? 0}</div>
              <div className="text-sm font-medium text-slate-300 mb-2">Governance Statuses</div>
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'stage', header: 'Stage' },
                  { key: 'state', header: 'State', render: (r: any) => <Badge variant={stateToBadge(r.state)} size="sm">{r.state}</Badge> },
                  { key: 'liveReady', header: 'Live Ready', render: (r: any) => r.liveReady ? 'Yes' : 'No' },
                  { key: 'degraded', header: 'Degraded', render: (r: any) => r.degraded ? 'Yes' : 'No' },
                ]}
                rows={governanceStatuses}
                density="compact"
                emptyTitle="No governance statuses"
              />
              <div className="mt-4 text-sm font-medium text-slate-300 mb-2">Health Statuses</div>
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'healthy', header: 'Healthy', render: (r: any) => <span className={r.healthy ? 'text-emerald-400' : 'text-rose-400'}>{r.healthy ? 'Yes' : 'No'}</span> },
                  { key: 'checkCount', header: 'Checks', align: 'right' },
                  { key: 'issueCount', header: 'Issues', align: 'right' },
                ]}
                rows={healthStatuses}
                density="compact"
                emptyTitle="No health statuses"
              />
            </Card>

            <Card>
              <CardHeader title="Governance Actions" />
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'action', header: 'Action' },
                  { key: 'reason', header: 'Reason' },
                  { key: 'timestamp', header: 'Time', render: (r: any) => fmtDateTime(r.timestamp) }
                ]}
                rows={governanceActions}
                density="compact"
                emptyTitle="No governance actions"
              />
            </Card>

            <Card>
              <CardHeader title="Operator Actions" />
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'action', header: 'Action' },
                  { key: 'operatorId', header: 'Operator' },
                  { key: 'note', header: 'Note' },
                  { key: 'timestamp', header: 'Time', render: (r: any) => fmtDateTime(r.timestamp) }
                ]}
                rows={operatorActions}
                density="compact"
                emptyTitle="No operator actions"
              />
              <form onSubmit={applyOperatorAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Select name="strategyId" defaultValue={strategies[0]?.id || ''}>
                  {strategies.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </Select>
                <Select name="action" defaultValue="approve_live_candidate">
                  <option value="approve_live_candidate">approve_live_candidate</option>
                  <option value="reject_candidate">reject_candidate</option>
                  <option value="rollback_runtime">rollback_runtime</option>
                  <option value="acknowledge_degraded">acknowledge_degraded</option>
                </Select>
                <Input name="note" placeholder="Note (optional)" />
                <LoadingButton type="submit" loading={loadingAction === 'op-action'} variant="primary">Apply</LoadingButton>
              </form>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="evaluations" activeId={activeTab}>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Latest Evaluations" />
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'metric', header: 'Metric' },
                  { key: 'value', header: 'Value', align: 'right', render: (r: any) => fmtNumber(r.value, 4) },
                  { key: 'asOf', header: 'As Of', render: (r: any) => fmtDateTime(r.asOf) }
                ]}
                rows={latestEvaluations}
                density="compact"
                emptyTitle="No latest evaluations"
              />
            </Card>
            <Card>
              <CardHeader title="All Evaluations" />
              <DataTable
                columns={[
                  { key: 'strategyId', header: 'Strategy' },
                  { key: 'metric', header: 'Metric' },
                  { key: 'value', header: 'Value', align: 'right', render: (r: any) => fmtNumber(r.value, 4) },
                  { key: 'asOf', header: 'As Of', render: (r: any) => fmtDateTime(r.asOf) }
                ]}
                rows={evaluations}
                density="compact"
                emptyTitle="No evaluations"
              />
            </Card>
          </div>
        </TabPanel>
      </Tabs>

      {/* Drawers */}
      <BacktestDrawer open={backtestOpen} onClose={() => setBacktestOpen(false)} strategies={strategies} onResult={setResult} />
      <OptimizeDrawer open={optimizeOpen} onClose={() => setOptimizeOpen(false)} strategies={strategies} onResult={setResult} />
      <WalkForwardDrawer open={walkForwardOpen} onClose={() => setWalkForwardOpen(false)} strategies={strategies} onResult={setResult} />
      <RuntimeOptimizeDrawer open={rtOptOpen} onClose={() => setRtOptOpen(false)} strategies={strategies} onResult={setResult} />
      <PolicyDrawer open={policyOpen} onClose={() => setPolicyOpen(false)} strategies={strategies} />
    </div>
  )
}

function ActionCard({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-1 text-base font-semibold text-slate-200">{title}</div>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      <div className="mt-auto">{action}</div>
    </Card>
  )
}

function stateToBadge(state: string): any {
  const map: Record<string, any> = {
    running: 'success',
    starting: 'warning',
    stopping: 'warning',
    error: 'danger',
    open: 'danger',
    paused: 'warning',
    idle: 'default',
    stopped: 'default',
  }
  return map[state] || 'default'
}

// Drawers
function BacktestDrawer({ open, onClose, strategies, onResult }: any) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '')
  const [entry, setEntry] = useState('')
  const [exit, setExit] = useState('')
  const [size, setSize] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (strategies[0]?.id) setStrategyId(strategies[0].id) }, [strategies[0]?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { strategyId }
    const params: any = {}
    if (entry) params.entryThresholdBps = Number(entry)
    if (exit) params.exitThresholdBps = Number(exit)
    if (size) params.positionSizeUsd = Number(size)
    if (Object.keys(params).length) payload.parameters = params
    setLoading(true)
    try {
      const res = await apiPost('/api/backtests/run', payload)
      onResult(res.data)
      showToast('Backtest completed', 'success')
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="New Backtest" description="Configure backtest parameters">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Strategy">
          <div className="sm:col-span-2">
            <Label required>Strategy</Label>
            <Select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}>
              {strategies.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}
            </Select>
          </div>
        </FormSection>
        <FormSection title="Parameters" description="Leave empty to use defaults">
          <div><Label>Entry Threshold (bps)</Label><Input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} /></div>
          <div><Label>Exit Threshold (bps)</Label><Input type="number" value={exit} onChange={(e) => setExit(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Position Size (USD)</Label><Input type="number" value={size} onChange={(e) => setSize(e.target.value)} /></div>
        </FormSection>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <LoadingButton type="submit" loading={loading} variant="primary">Run Backtest</LoadingButton>
        </div>
      </form>
    </Drawer>
  )
}

function OptimizeDrawer({ open, onClose, strategies, onResult }: any) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '')
  const [objective, setObjective] = useState('netPnl')
  const [entryMin, setEntryMin] = useState('')
  const [entryMax, setEntryMax] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (strategies[0]?.id) setStrategyId(strategies[0].id) }, [strategies[0]?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { strategyId, objective, parameterRanges: {} }
    if (entryMin && entryMax) payload.parameterRanges.entryThresholdBps = { min: Number(entryMin), max: Number(entryMax), step: 10 }
    setLoading(true)
    try {
      const res = await apiPost('/api/backtests/optimize', payload)
      onResult(res.data)
      showToast('Optimization completed', 'success')
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Optimize" description="Find optimal parameters">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Strategy & Objective">
          <div><Label required>Strategy</Label><Select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}>{strategies.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}</Select></div>
          <div><Label required>Objective</Label><Select value={objective} onChange={(e) => setObjective(e.target.value)}><option value="netPnl">netPnl</option><option value="sharpeLike">sharpeLike</option><option value="maxDrawdownPct">maxDrawdownPct</option></Select></div>
        </FormSection>
        <FormSection title="Parameter Range">
          <div><Label>Entry Min (bps)</Label><Input type="number" value={entryMin} onChange={(e) => setEntryMin(e.target.value)} /></div>
          <div><Label>Entry Max (bps)</Label><Input type="number" value={entryMax} onChange={(e) => setEntryMax(e.target.value)} /></div>
        </FormSection>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <LoadingButton type="submit" loading={loading} variant="primary">Run Optimize</LoadingButton>
        </div>
      </form>
    </Drawer>
  )
}

function WalkForwardDrawer({ open, onClose, strategies, onResult }: any) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '')
  const [objective, setObjective] = useState('netPnl')
  const [trainSize, setTrainSize] = useState('200')
  const [testSize, setTestSize] = useState('50')
  const [stepSize, setStepSize] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (strategies[0]?.id) setStrategyId(strategies[0].id) }, [strategies[0]?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { strategyId, objective, trainSize: Number(trainSize), testSize: Number(testSize), parameterRanges: {} }
    if (stepSize) payload.stepSize = Number(stepSize)
    setLoading(true)
    try {
      const res = await apiPost('/api/backtests/walk-forward', payload)
      onResult(res.data)
      showToast('Walk-forward completed', 'success')
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Walk-Forward" description="Validate parameter robustness">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Strategy & Objective">
          <div><Label required>Strategy</Label><Select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}>{strategies.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}</Select></div>
          <div><Label required>Objective</Label><Select value={objective} onChange={(e) => setObjective(e.target.value)}><option value="netPnl">netPnl</option><option value="sharpeLike">sharpeLike</option><option value="maxDrawdownPct">maxDrawdownPct</option></Select></div>
        </FormSection>
        <FormSection title="Dataset Splits">
          <div><Label required>Train Size</Label><Input type="number" value={trainSize} onChange={(e) => setTrainSize(e.target.value)} /></div>
          <div><Label required>Test Size</Label><Input type="number" value={testSize} onChange={(e) => setTestSize(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Step Size (optional)</Label><Input type="number" value={stepSize} onChange={(e) => setStepSize(e.target.value)} /></div>
        </FormSection>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <LoadingButton type="submit" loading={loading} variant="primary">Run Walk-Forward</LoadingButton>
        </div>
      </form>
    </Drawer>
  )
}

function RuntimeOptimizeDrawer({ open, onClose, strategies, onResult }: any) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [objective, setObjective] = useState('netPnl')
  const [limit, setLimit] = useState('128')
  const [applyToRuntime, setApplyToRuntime] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (strategies[0]?.id) setStrategyId(strategies[0].id) }, [strategies[0]?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiPost('/api/strategies/runtime/optimize', {
        strategyId, objective, symbol, limit: Number(limit), applyToRuntime, parameterRanges: {}
      })
      onResult(res.data)
      showToast('Runtime optimization completed', 'success')
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Runtime Optimize" description="Optimize strategy parameters at runtime">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Target">
          <div><Label required>Strategy</Label><Select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}>{strategies.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}</Select></div>
          <div><Label required>Symbol</Label><Input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></div>
        </FormSection>
        <FormSection title="Configuration">
          <div><Label required>Objective</Label><Select value={objective} onChange={(e) => setObjective(e.target.value)}><option value="netPnl">netPnl</option><option value="sharpeLike">sharpeLike</option><option value="maxDrawdownPct">maxDrawdownPct</option></Select></div>
          <div><Label required>Limit</Label><Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="rtApply" type="checkbox" checked={applyToRuntime} onChange={(e) => setApplyToRuntime(e.target.checked)} className="h-4 w-4 rounded border-surface-border bg-slate-950 text-emerald-600" />
            <Label>Apply to runtime</Label>
          </div>
        </FormSection>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <LoadingButton type="submit" loading={loading} variant="primary">Run</LoadingButton>
        </div>
      </form>
    </Drawer>
  )
}

function PolicyDrawer({ open, onClose, strategies }: any) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [objective, setObjective] = useState('netPnl')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (strategies[0]?.id) setStrategyId(strategies[0].id) }, [strategies[0]?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost('/api/strategies/runtime/optimization/policies/upsert', {
        strategyId, objective, symbol, applyToRuntime: true, parameterRanges: {}
      })
      showToast('Policy upserted', 'success')
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Upsert Policy" description="Add or update optimization policy">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Policy">
          <div><Label required>Strategy</Label><Select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}>{strategies.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}</Select></div>
          <div><Label required>Symbol</Label><Input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label required>Objective</Label><Select value={objective} onChange={(e) => setObjective(e.target.value)}><option value="netPnl">netPnl</option><option value="sharpeLike">sharpeLike</option><option value="maxDrawdownPct">maxDrawdownPct</option></Select></div>
        </FormSection>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <LoadingButton type="submit" loading={loading} variant="primary">Upsert</LoadingButton>
        </div>
      </form>
    </Drawer>
  )
}
