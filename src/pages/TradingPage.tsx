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
  const [symbol, setSymbol] = useState('')
  const [side, setSide] = useState('buy')
  const [qty, setQty] = useState('')

  usePolling(async () => {
    const [sRes, oRes, pRes, eRes] = await Promise.all([
      apiGet('/api/system/summary'),
      apiGet('/api/orders'),
      apiGet('/api/positions'),
      apiGet('/api/orders/executions')
    ])
    setSummary(sRes.data)
    setOrders(oRes.data || [])
    setPositions(pRes.data || [])
    setExecutions(eRes.data || [])
  }, 5000)

  const isPaper = summary?.mode === 'paper'

  const handlePaperOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/orders/paper', {
        strategyId: 'admin-ui',
        symbol,
        instrumentKind: 'perpetual',
        side,
        type: 'market',
        quantity: Number(qty)
      })
      showToast('Paper order submitted', 'success')
      setSymbol('')
      setQty('')
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

      {isPaper && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Paper Order</h3>
          <form onSubmit={handlePaperOrder} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
              placeholder="Symbol (e.g. BTCUSDT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <select
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
              value={side}
              onChange={(e) => setSide(e.target.value)}
            >
              <option value="buy">buy</option>
              <option value="sell">sell</option>
            </select>
            <input
              type="number"
              step="any"
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100"
              placeholder="Quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button type="submit" className="px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">
              Submit
            </button>
          </form>
        </div>
      )}

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
