import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { fmtNumber, fmtUsd, fmtDateTime, clsForPnl, clsForSide } from '../lib/utils'

export function TradingPage() {
  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [tracker, setTracker] = useState<any>(null)
  const [planResult, setPlanResult] = useState<any>(null)
  const [symbol, setSymbol] = useState('')
  const [side, setSide] = useState('buy')
  const [qty, setQty] = useState('')
  const [orderType, setOrderType] = useState('market')
  const [price, setPrice] = useState('')
  const [notional, setNotional] = useState('')
  const [useNotional, setUseNotional] = useState(false)
  const [instrumentKind, setInstrumentKind] = useState('perpetual')

  usePolling(async () => {
    const [sRes, oRes, pRes, eRes, tRes] = await Promise.all([
      apiGet('/api/system/summary'),
      apiGet('/api/orders'),
      apiGet('/api/positions'),
      apiGet('/api/orders/executions'),
      apiGet('/api/orders/tracker')
    ])
    setSummary(sRes.data)
    setOrders(oRes.data || [])
    setPositions(pRes.data || [])
    setExecutions(eRes.data || [])
    setTracker(tRes.data)
  }, 5000)

  const isPaper = summary?.mode === 'paper'

  const buildOrderPayload = () => {
    const payload: any = {
      strategyId: 'admin-ui',
      symbol,
      instrumentKind,
      side,
      type: orderType
    }
    if (useNotional) {
      if (notional) payload.notionalUsd = Number(notional)
    } else {
      if (qty) payload.quantity = Number(qty)
    }
    if (orderType === 'limit' && price) payload.price = Number(price)
    return payload
  }

  const handlePaperOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/orders/paper', buildOrderPayload())
      showToast('Paper order submitted', 'success')
      setSymbol('')
      setQty('')
      setNotional('')
      setPrice('')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handlePlanIntent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiPost('/api/orders/intents/plan', buildOrderPayload())
      setPlanResult(res.data)
      showToast('Intent planned', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleExecuteIntent = async () => {
    try {
      const res = await apiPost('/api/orders/intents/execute', buildOrderPayload())
      setPlanResult(res.data)
      showToast('Intent executed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiPost('/api/orders/execute', buildOrderPayload())
      setPlanResult(res.data)
      showToast('Order executed', 'success')
      setSymbol('')
      setQty('')
      setNotional('')
      setPrice('')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const execRows = executions.map((ex) => {
    const payload = ex.payload || ex
    const order = payload.order || {}
    return {
      symbol: order.symbol || '-',
      side: order.side || '-',
      quantity: order.quantity,
      feePaid: payload.feePaid || 0,
      realizedPnlDelta: payload.realizedPnlDelta || 0,
      createdAt: ex.createdAt || order.submittedAt
    }
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Trading</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">New Order</h3>
        <form onSubmit={isPaper ? handlePaperOrder : handleExecuteOrder} className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-3">
          <input
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            placeholder="Symbol (e.g. BTCUSDT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={instrumentKind}
            onChange={(e) => setInstrumentKind(e.target.value)}
          >
            <option value="perpetual">perpetual</option>
            <option value="spot">spot</option>
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={side}
            onChange={(e) => setSide(e.target.value)}
          >
            <option value="buy">buy</option>
            <option value="sell">sell</option>
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="market">market</option>
            <option value="limit">limit</option>
          </select>
          <div className="flex items-center gap-2">
            {!useNotional ? (
              <input
                type="number"
                step="any"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
                placeholder="Quantity"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            ) : (
              <input
                type="number"
                step="any"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
                placeholder="Notional USD"
                value={notional}
                onChange={(e) => setNotional(e.target.value)}
              />
            )}
          </div>
          <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">
            {isPaper ? 'Paper Submit' : 'Execute'}
          </button>
        </form>
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useNotional}
              onChange={(e) => setUseNotional(e.target.checked)}
            />
            Use Notional USD
          </label>
          {orderType === 'limit' && (
            <input
              type="number"
              step="any"
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 w-40"
              placeholder="Limit Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePlanIntent} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white">Plan Intent</button>
          <button onClick={handleExecuteIntent} className="px-3 py-1.5 rounded text-xs bg-amber-600 hover:bg-amber-500 text-white">Execute Intent</button>
        </div>
        {planResult && (
          <div className="mt-3">
            <div className="text-xs text-slate-400 mb-1">Plan / Execution Result</div>
            <pre className="text-xs text-slate-400 overflow-x-auto">{JSON.stringify(planResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Order Tracker</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
          <div className="bg-slate-950 border border-slate-800 rounded p-2">
            <div className="text-xs text-slate-400">Pending</div>
            <div className="text-slate-100 font-medium">{tracker?.pendingCount ?? '-'}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded p-2">
            <div className="text-xs text-slate-400">Filled</div>
            <div className="text-slate-100 font-medium">{tracker?.filledCount ?? '-'}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded p-2">
            <div className="text-xs text-slate-400">Failed</div>
            <div className="text-slate-100 font-medium">{tracker?.failedCount ?? '-'}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded p-2">
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-slate-100 font-medium">{tracker?.totalCount ?? '-'}</div>
          </div>
        </div>
        <DataTable
          columns={[
            { label: 'Tracker ID', key: 'trackerId' },
            { label: 'Symbol', key: 'symbol' },
            { label: 'Side', key: 'side', render: (r: any) => <span className={clsForSide(r.side)}>{r.side}</span> },
            { label: 'Status', key: 'status' },
            { label: 'Qty', key: 'quantity', align: 'right', render: (r: any) => fmtNumber(r.quantity, 4) }
          ]}
          rows={tracker?.trackers || []}
          emptyText="No tracked orders"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Orders</h3>
        <DataTable
          columns={[
            { label: 'Symbol', key: 'symbol' },
            { label: 'Side', key: 'side', render: (r) => <span className={clsForSide(r.side)}>{r.side}</span> },
            { label: 'Type', key: 'type' },
            { label: 'Qty', key: 'quantity', align: 'right', render: (r) => fmtNumber(r.quantity, 4) },
            { label: 'Status', key: 'status' },
            { label: 'Submitted', key: 'submittedAt', render: (r) => fmtDateTime(r.submittedAt) }
          ]}
          rows={orders}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Positions</h3>
        <DataTable
          columns={[
            { label: 'Symbol', key: 'symbol' },
            { label: 'Net Qty', key: 'netQuantity', align: 'right', render: (r) => fmtNumber(r.netQuantity, 4) },
            { label: 'Entry', key: 'averageEntryPrice', align: 'right', render: (r) => fmtUsd(r.averageEntryPrice) },
            { label: 'Mark', key: 'lastMarkPrice', align: 'right', render: (r) => fmtUsd(r.lastMarkPrice) },
            { label: 'Unrealized', key: 'unrealizedPnl', align: 'right', render: (r) => <span className={clsForPnl(r.unrealizedPnl)}>{fmtUsd(r.unrealizedPnl)}</span> },
            { label: 'Realized', key: 'realizedPnl', align: 'right', render: (r) => <span className={clsForPnl(r.realizedPnl)}>{fmtUsd(r.realizedPnl)}</span> },
            { label: 'Notional', key: 'notional', align: 'right', render: (r) => fmtUsd(r.notional) }
          ]}
          rows={positions}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Executions</h3>
        <DataTable
          columns={[
            { label: 'Symbol', key: 'symbol' },
            { label: 'Side', key: 'side', render: (r) => <span className={clsForSide(r.side)}>{r.side}</span> },
            { label: 'Qty', key: 'quantity', align: 'right', render: (r) => fmtNumber(r.quantity, 4) },
            { label: 'Fee', key: 'feePaid', align: 'right', render: (r) => fmtUsd(r.feePaid) },
            { label: 'Realized PnL', key: 'realizedPnlDelta', align: 'right', render: (r) => <span className={clsForPnl(r.realizedPnlDelta)}>{fmtUsd(r.realizedPnlDelta)}</span> },
            { label: 'Time', key: 'createdAt', render: (r) => fmtDateTime(r.createdAt) }
          ]}
          rows={execRows}
        />
      </div>
    </div>
  )
}
