import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'

export function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [presets, setPresets] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)

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

  useEffect(() => {
    apiGet('/api/strategies').then((res) => {
      setStrategies(res.data.strategies || [])
      setPresets(res.data.presets || [])
      if (res.data.strategies?.length) {
        setBtStrategy(res.data.strategies[0].id)
        setOptStrategy(res.data.strategies[0].id)
      }
    })
  }, [])

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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Strategies</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Strategies & Presets</h3>
        <DataTable
          columns={[
            { label: 'ID', key: 'id' },
            { label: 'Name', key: 'name' },
            { label: 'Description', key: 'description' }
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

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Result</h3>
        <pre className="text-xs text-slate-400 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  )
}
