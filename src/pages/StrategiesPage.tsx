import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { badgeClass, fmtNumber, fmtDateTime } from '../lib/utils'

export function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [presets, setPresets] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [runtimeStatuses, setRuntimeStatuses] = useState<any[]>([])
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null)
  const [optimizationStatus, setOptimizationStatus] = useState<any>(null)
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [latestEvaluations, setLatestEvaluations] = useState<any[]>([])

  // governance
  const [governanceStatuses, setGovernanceStatuses] = useState<any[]>([])
  const [healthStatuses, setHealthStatuses] = useState<any[]>([])
  const [governanceScheduler, setGovernanceScheduler] = useState<any>(null)
  const [governanceActions, setGovernanceActions] = useState<any[]>([])
  const [operatorActions, setOperatorActions] = useState<any[]>([])

  // backtest form
  const [btStrategy, setBtStrategy] = useState('')
  const [btEntry, setBtEntry] = useState('')
  const [btExit, setBtExit] = useState('')
  const [btSize, setBtSize] = useState('')

  // optimize form
  const [optStrategy, setOptStrategy] = useState('')
  const [optObjective, setOptObjective] = useState('netPnl')
  const [optEntryMin, setOptEntryMin] = useState('')
  const [optEntryMax, setOptEntryMax] = useState('')

  // walk-forward form
  const [wfStrategy, setWfStrategy] = useState('')
  const [wfObjective, setWfObjective] = useState('netPnl')
  const [wfTrainSize, setWfTrainSize] = useState('200')
  const [wfTestSize, setWfTestSize] = useState('50')
  const [wfStepSize, setWfStepSize] = useState('')

  // runtime optimize form
  const [rtOptStrategy, setRtOptStrategy] = useState('')
  const [rtOptSymbol, setRtOptSymbol] = useState('BTCUSDT')
  const [rtOptObjective, setRtOptObjective] = useState('netPnl')
  const [rtOptLimit, setRtOptLimit] = useState('128')
  const [rtOptApply, setRtOptApply] = useState(true)

  // runtime policy form
  const [policyStrategy, setPolicyStrategy] = useState('')
  const [policySymbol, setPolicySymbol] = useState('BTCUSDT')
  const [policyObjective, setPolicyObjective] = useState('netPnl')
  const [policyInterval, setPolicyInterval] = useState('30000')

  // governance operator action form
  const [govActionStrategy, setGovActionStrategy] = useState('')
  const [govActionType, setGovActionType] = useState('approve_live_candidate')
  const [govActionNote, setGovActionNote] = useState('')

  // live promotion
  const [livePromotions, setLivePromotions] = useState<Record<string, any>>({})

  const fetchLivePromotion = async (strategyId: string) => {
    try {
      const res = await apiGet(`/api/strategies/governance/${strategyId}/live-promotion`)
      setLivePromotions((prev) => ({ ...prev, [strategyId]: res.data }))
    } catch {
      // ignore errors for missing promotions
    }
  }

  useEffect(() => {
    apiGet('/api/strategies').then((res) => {
      const list = res.data.strategies || []
      setStrategies(list)
      setPresets(res.data.presets || [])
      if (list.length) {
        const first = list[0].id
        setBtStrategy(first)
        setOptStrategy(first)
        setWfStrategy(first)
        setRtOptStrategy(first)
        setPolicyStrategy(first)
        setGovActionStrategy(first)
        list.forEach((s: any) => fetchLivePromotion(s.id))
      }
    })
  }, [])

  usePolling(async () => {
    const [
      rtRes,
      schRes,
      optRes,
      evRes,
      leRes,
      govRes,
      healthRes,
      govSchRes,
      govActRes,
      opActRes
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

  const runBacktest = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { strategyId: btStrategy }
    const params: any = {}
    if (btEntry) params.entryThresholdBps = Number(btEntry)
    if (btExit) params.exitThresholdBps = Number(btExit)
    if (btSize) params.positionSizeUsd = Number(btSize)
    if (Object.keys(params).length) payload.parameters = params
    try {
      const res = await apiPost('/api/backtests/run', payload)
      setResult(res.data)
      showToast('Backtest completed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const runOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      strategyId: optStrategy,
      objective: optObjective,
      parameterRanges: {}
    }
    if (optEntryMin && optEntryMax) {
      payload.parameterRanges.entryThresholdBps = {
        min: Number(optEntryMin),
        max: Number(optEntryMax),
        step: 10
      }
    }
    try {
      const res = await apiPost('/api/backtests/optimize', payload)
      setResult(res.data)
      showToast('Optimization completed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const runWalkForward = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      strategyId: wfStrategy,
      objective: wfObjective,
      trainSize: Number(wfTrainSize),
      testSize: Number(wfTestSize),
      parameterRanges: {}
    }
    if (wfStepSize) payload.stepSize = Number(wfStepSize)
    try {
      const res = await apiPost('/api/backtests/walk-forward', payload)
      setResult(res.data)
      showToast('Walk-forward completed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const runRuntimeOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiPost('/api/strategies/runtime/optimize', {
        strategyId: rtOptStrategy,
        objective: rtOptObjective,
        symbol: rtOptSymbol,
        limit: Number(rtOptLimit),
        applyToRuntime: rtOptApply,
        parameterRanges: {}
      })
      setResult(res.data)
      showToast('Runtime optimization completed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const upsertPolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiPost('/api/strategies/runtime/optimization/policies/upsert', {
        strategyId: policyStrategy,
        objective: policyObjective,
        symbol: policySymbol,
        applyToRuntime: true,
        parameterRanges: {}
      })
      setOptimizationStatus(res.data)
      showToast('Policy upserted', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const removePolicy = async (strategyId: string, symbol: string) => {
    try {
      await apiPost('/api/strategies/runtime/optimization/policies/remove', { strategyId, symbol })
      showToast('Policy removed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleRuntimeStart = async (strategyId: string, params?: any) => {
    try {
      const payload: any = { strategyId }
      if (params) payload.parameters = params
      await apiPost('/api/strategies/runtime/start', payload)
      showToast('Runtime started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleRuntimeStop = async (strategyId: string) => {
    try {
      await apiPost('/api/strategies/runtime/stop', { strategyId })
      showToast('Runtime stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleRuntimeTick = async (strategyId: string) => {
    try {
      await apiPost('/api/strategies/runtime/tick', { strategyId })
      showToast('Runtime ticked', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleRuntimePause = async (strategyId: string) => {
    try {
      await apiPost('/api/strategies/runtime/pause', { strategyId })
      showToast('Runtime paused', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleSchedulerStart = async () => {
    try {
      await apiPost('/api/strategies/runtime/scheduler/start', {})
      showToast('Scheduler started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleSchedulerStop = async () => {
    try {
      await apiPost('/api/strategies/runtime/scheduler/stop', {})
      showToast('Scheduler stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleSchedulerTick = async () => {
    try {
      await apiPost('/api/strategies/runtime/scheduler/tick', {})
      showToast('Scheduler ticked', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleOptSchedulerStart = async () => {
    try {
      await apiPost('/api/strategies/runtime/optimization/scheduler/start', { intervalMs: Number(policyInterval) })
      showToast('Optimization scheduler started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleOptSchedulerStop = async () => {
    try {
      await apiPost('/api/strategies/runtime/optimization/scheduler/stop', {})
      showToast('Optimization scheduler stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleOptSchedulerTick = async () => {
    try {
      await apiPost('/api/strategies/runtime/optimization/scheduler/tick', {})
      showToast('Optimization scheduler ticked', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleGovSchedulerStart = async () => {
    try {
      await apiPost('/api/strategies/governance/scheduler/start', {})
      showToast('Governance scheduler started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleGovSchedulerStop = async () => {
    try {
      await apiPost('/api/strategies/governance/scheduler/stop', {})
      showToast('Governance scheduler stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleGovSchedulerTick = async () => {
    try {
      await apiPost('/api/strategies/governance/scheduler/tick', {})
      showToast('Governance scheduler ticked', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const applyOperatorAction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/strategies/governance/operator-actions', {
        strategyId: govActionStrategy,
        action: govActionType,
        ...(govActionNote ? { note: govActionNote } : {})
      })
      showToast('Operator action applied', 'success')
      setGovActionNote('')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Strategies</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Strategies & Presets</h3>
        <DataTable
          columns={[
            { label: 'ID', key: 'id' },
            { label: 'Name', key: 'name' },
            { label: 'Description', key: 'description' },
            {
              label: 'Live Promo',
              key: 'livePromotion',
              render: (r) => {
                const promo = livePromotions[r.id]
                if (!promo) return <span className="text-slate-500">-</span>
                return (
                  <span className={promo.approved ? 'text-emerald-400' : 'text-amber-400'}>
                    {promo.approved ? 'Approved' : promo.pending ? 'Pending' : 'Not Ready'}
                  </span>
                )
              }
            }
          ]}
          rows={strategies}
        />
        {presets.length > 0 && (
          <>
            <div className="text-sm font-medium text-slate-300 mt-4 mb-1">Presets</div>
            <DataTable
              columns={[
                { label: 'ID', key: 'id' },
                { label: 'Strategy', key: 'strategyId' },
                { label: 'Params', key: 'parameters', render: (r) => JSON.stringify(r.parameters) }
              ]}
              rows={presets}
            />
          </>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Runtime Status</h3>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            {
              label: 'State',
              key: 'state',
              render: (r) => (
                <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(r.state)}`}>{r.state}</span>
              )
            },
            { label: 'Mode', key: 'mode' },
            { label: 'Venue', key: 'executionVenue' },
            { label: 'Ticks', key: 'tickCount', align: 'right' },
            { label: 'Signals', key: 'signalCount', align: 'right' },
            { label: 'Execs', key: 'executionCount', align: 'right' },
            {
              label: 'Actions',
              key: 'actions',
              render: (r) => (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => handleRuntimeStart(r.strategyId)}
                    className="px-2 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleRuntimeTick(r.strategyId)}
                    className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Tick
                  </button>
                  <button
                    onClick={() => handleRuntimePause(r.strategyId)}
                    className="px-2 py-1 rounded text-xs bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleRuntimeStop(r.strategyId)}
                    className="px-2 py-1 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Stop
                  </button>
                </div>
              )
            }
          ]}
          rows={runtimeStatuses}
          emptyText="No runtime instances"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Runtime Scheduler</h3>
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
          Tick Count: {schedulerStatus?.tickCount ?? 0} | Executions: {schedulerStatus?.executionCount ?? 0}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Backtest</h3>
        <form onSubmit={runBacktest} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={btStrategy}
            onChange={(e) => setBtStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Entry bps"
            value={btEntry}
            onChange={(e) => setBtEntry(e.target.value)}
          />
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Exit bps"
            value={btExit}
            onChange={(e) => setBtExit(e.target.value)}
          />
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Size USD"
            value={btSize}
            onChange={(e) => setBtSize(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Run</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Optimize</h3>
        <form onSubmit={runOptimize} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={optStrategy}
            onChange={(e) => setOptStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={optObjective}
            onChange={(e) => setOptObjective(e.target.value)}
          >
            <option value="netPnl">netPnl</option>
            <option value="sharpeLike">sharpeLike</option>
            <option value="maxDrawdownPct">maxDrawdownPct</option>
          </select>
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Entry min"
            value={optEntryMin}
            onChange={(e) => setOptEntryMin(e.target.value)}
          />
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Entry max"
            value={optEntryMax}
            onChange={(e) => setOptEntryMax(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white">Run</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Walk-Forward</h3>
        <form onSubmit={runWalkForward} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={wfStrategy}
            onChange={(e) => setWfStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={wfObjective}
            onChange={(e) => setWfObjective(e.target.value)}
          >
            <option value="netPnl">netPnl</option>
            <option value="sharpeLike">sharpeLike</option>
            <option value="maxDrawdownPct">maxDrawdownPct</option>
          </select>
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Train size"
            value={wfTrainSize}
            onChange={(e) => setWfTrainSize(e.target.value)}
          />
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Test size"
            value={wfTestSize}
            onChange={(e) => setWfTestSize(e.target.value)}
          />
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Step size (opt)"
            value={wfStepSize}
            onChange={(e) => setWfStepSize(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Run</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Runtime Optimize</h3>
        <form onSubmit={runRuntimeOptimize} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={rtOptStrategy}
            onChange={(e) => setRtOptStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <input
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Symbol"
            value={rtOptSymbol}
            onChange={(e) => setRtOptSymbol(e.target.value)}
          />
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={rtOptObjective}
            onChange={(e) => setRtOptObjective(e.target.value)}
          >
            <option value="netPnl">netPnl</option>
            <option value="sharpeLike">sharpeLike</option>
            <option value="maxDrawdownPct">maxDrawdownPct</option>
          </select>
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Limit"
            value={rtOptLimit}
            onChange={(e) => setRtOptLimit(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rtOptApply}
              onChange={(e) => setRtOptApply(e.target.checked)}
            />
            Apply to runtime
          </label>
          <button type="submit" className="px-3 py-2 rounded text-sm bg-amber-600 hover:bg-amber-500 text-white">Run</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Optimization Scheduler</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(optimizationStatus?.scheduler?.state || 'stopped')}`}>
              {optimizationStatus?.scheduler?.state || 'stopped'}
            </span>
            <button onClick={handleOptSchedulerStart} className="px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white">Start</button>
            <button onClick={handleOptSchedulerTick} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white">Tick</button>
            <button onClick={handleOptSchedulerStop} className="px-3 py-1.5 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white">Stop</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Tick Count: {optimizationStatus?.scheduler?.tickCount ?? 0} | Interval: {policyInterval}ms
        </div>
        <h4 className="text-xs font-medium text-slate-400 mb-2">Policies</h4>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Symbol', key: 'symbol' },
            { label: 'Objective', key: 'objective' },
            { label: 'Apply', key: 'applyToRuntime', render: (r) => (r.applyToRuntime ? 'Yes' : 'No') },
            {
              label: 'Actions',
              key: 'actions',
              render: (r) => (
                <button
                  onClick={() => removePolicy(String(r.strategyId), String(r.symbol))}
                  className="px-2 py-1 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Remove
                </button>
              )
            }
          ]}
          rows={optimizationStatus?.policies || []}
          emptyText="No policies"
        />
        <form onSubmit={upsertPolicy} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={policyStrategy}
            onChange={(e) => setPolicyStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <input
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Symbol"
            value={policySymbol}
            onChange={(e) => setPolicySymbol(e.target.value)}
          />
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={policyObjective}
            onChange={(e) => setPolicyObjective(e.target.value)}
          >
            <option value="netPnl">netPnl</option>
            <option value="sharpeLike">sharpeLike</option>
            <option value="maxDrawdownPct">maxDrawdownPct</option>
          </select>
          <input
            type="number"
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Interval ms"
            value={policyInterval}
            onChange={(e) => setPolicyInterval(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Upsert Policy</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Governance Scheduler</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(governanceScheduler?.state || 'stopped')}`}>
              {governanceScheduler?.state || 'stopped'}
            </span>
            <button onClick={handleGovSchedulerStart} className="px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white">Start</button>
            <button onClick={handleGovSchedulerTick} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white">Tick</button>
            <button onClick={handleGovSchedulerStop} className="px-3 py-1.5 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white">Stop</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Tick Count: {governanceScheduler?.tickCount ?? 0}
        </div>
        <h4 className="text-xs font-medium text-slate-400 mb-2">Governance Statuses</h4>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Stage', key: 'stage' },
            { label: 'State', key: 'state', render: (r) => <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(r.state)}`}>{r.state}</span> },
            { label: 'Live Ready', key: 'liveReady', render: (r) => (r.liveReady ? 'Yes' : 'No') },
            { label: 'Degraded', key: 'degraded', render: (r) => (r.degraded ? 'Yes' : 'No') }
          ]}
          rows={governanceStatuses}
          emptyText="No governance statuses"
        />
        <h4 className="text-xs font-medium text-slate-400 mb-2 mt-3">Health Statuses</h4>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Healthy', key: 'healthy', render: (r) => <span className={r.healthy ? 'text-emerald-400' : 'text-rose-400'}>{r.healthy ? 'Yes' : 'No'}</span> },
            { label: 'Checks', key: 'checkCount', align: 'right' },
            { label: 'Issues', key: 'issueCount', align: 'right' }
          ]}
          rows={healthStatuses}
          emptyText="No health statuses"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Governance Actions</h3>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Action', key: 'action' },
            { label: 'Reason', key: 'reason' },
            { label: 'Time', key: 'timestamp', render: (r) => fmtDateTime(r.timestamp) }
          ]}
          rows={governanceActions}
          emptyText="No governance actions"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Operator Actions</h3>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Action', key: 'action' },
            { label: 'Operator', key: 'operatorId' },
            { label: 'Note', key: 'note' },
            { label: 'Time', key: 'timestamp', render: (r) => fmtDateTime(r.timestamp) }
          ]}
          rows={operatorActions}
          emptyText="No operator actions"
        />
        <form onSubmit={applyOperatorAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={govActionStrategy}
            onChange={(e) => setGovActionStrategy(e.target.value)}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={govActionType}
            onChange={(e) => setGovActionType(e.target.value)}
          >
            <option value="approve_live_candidate">approve_live_candidate</option>
            <option value="reject_candidate">reject_candidate</option>
            <option value="rollback_runtime">rollback_runtime</option>
            <option value="acknowledge_degraded">acknowledge_degraded</option>
          </select>
          <input
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Note (optional)"
            value={govActionNote}
            onChange={(e) => setGovActionNote(e.target.value)}
          />
          <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Apply</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Latest Evaluations</h3>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Metric', key: 'metric' },
            { label: 'Value', key: 'value', align: 'right', render: (r) => fmtNumber(r.value, 4) },
            { label: 'As Of', key: 'asOf', render: (r) => fmtDateTime(r.asOf) }
          ]}
          rows={latestEvaluations}
          emptyText="No latest evaluations"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">All Evaluations</h3>
        <DataTable
          columns={[
            { label: 'Strategy', key: 'strategyId' },
            { label: 'Metric', key: 'metric' },
            { label: 'Value', key: 'value', align: 'right', render: (r) => fmtNumber(r.value, 4) },
            { label: 'As Of', key: 'asOf', render: (r) => fmtDateTime(r.asOf) }
          ]}
          rows={evaluations}
          emptyText="No evaluations"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Result</h3>
        <pre className="text-xs text-slate-400 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  )
}
