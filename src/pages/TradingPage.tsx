import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { PageHeader } from '../components/composite/PageHeader'
import { ModeBadge } from '../components/ui/LiveIndicator'
import { FlashValue } from '../components/ui/FlashValue'
import { LoadingButton } from '../components/ui/LoadingButton'
import { Button } from '../components/ui/Button'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { Input, Select, Label } from '../components/ui/Input'
import { showToast } from '../components/ToastContainer'
import { fmtNumber, fmtUsd, fmtDateTime, clsForPnl, clsForSide } from '../lib/utils'

export function TradingPage() {
  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [tracker, setTracker] = useState<any>(null)
  const [planResult, setPlanResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('desk')
  const [submitting, setSubmitting] = useState(false)
  const [planning, setPlanning] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const endpoint = isPaper ? '/api/orders/paper' : '/api/orders/execute'
      const res = await apiPost(endpoint, buildOrderPayload())
      setPlanResult(res.data)
      showToast(isPaper ? 'Paper order submitted' : 'Order executed', 'success')
      setSymbol('')
      setQty('')
      setNotional('')
      setPrice('')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setPlanning(true)
    try {
      const res = await apiPost('/api/orders/intents/plan', buildOrderPayload())
      setPlanResult(res.data)
      showToast('Intent planned', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setPlanning(false)
    }
  }

  const handleExecuteIntent = async () => {
    setSubmitting(true)
    try {
      const res = await apiPost('/api/orders/intents/execute', buildOrderPayload())
      setPlanResult(res.data)
      showToast('Intent executed', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
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
      <PageHeader
        title="Trading"
        description="Place orders and monitor positions"
        actions={<ModeBadge mode={summary?.mode} />}
      />

      <Tabs
        tabs={[
          { id: 'desk', label: 'Trading Desk' },
          { id: 'tracker', label: 'Tracker' },
          { id: 'orders', label: 'Orders', badge: orders.length },
          { id: 'positions', label: 'Positions' },
          { id: 'executions', label: 'Executions' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel id="desk" activeId={activeTab}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader title="New Order" />
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label required>Symbol</Label>
                  <Input
                    placeholder="e.g. BTCUSDT"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label required>Instrument</Label>
                    <Select value={instrumentKind} onChange={(e) => setInstrumentKind(e.target.value)}>
                      <option value="perpetual">Perpetual</option>
                      <option value="spot">Spot</option>
                    </Select>
                  </div>
                  <div>
                    <Label required>Side</Label>
                    <Select value={side} onChange={(e) => setSide(e.target.value)}>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label required>Order Type</Label>
                  <Select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                  </Select>
                </div>
                {orderType === 'limit' && (
                  <div>
                    <Label required>Limit Price</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    id="useNotional"
                    type="checkbox"
                    checked={useNotional}
                    onChange={(e) => setUseNotional(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-border bg-slate-950 text-emerald-600"
                  />
                  <Label>Use Notional USD</Label>
                </div>
                {!useNotional ? (
                  <div>
                    <Label required>Quantity</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Quantity"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <Label required>Notional USD</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Notional USD"
                      value={notional}
                      onChange={(e) => setNotional(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <LoadingButton
                    type="submit"
                    loading={submitting}
                    variant="primary"
                    className="flex-1"
                  >
                    {isPaper ? 'Paper Submit' : 'Execute'}
                  </LoadingButton>
                </div>
                <div className="flex gap-2">
                  <LoadingButton
                    type="button"
                    loading={planning}
                    variant="secondary"
                    onClick={handlePlan}
                    className="flex-1"
                  >
                    Plan Intent
                  </LoadingButton>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleExecuteIntent}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Execute Intent
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Plan / Execution Result" />
              {planResult ? (
                <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-400">
                  {JSON.stringify(planResult, null, 2)}
                </pre>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  Submit an order or plan to see results
                </div>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="tracker" activeId={activeTab}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <Card padding="compact">
              <div className="text-xs text-slate-500">Pending</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                <FlashValue value={tracker?.pendingCount}>{tracker?.pendingCount ?? '-'}</FlashValue>
              </div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Filled</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                <FlashValue value={tracker?.filledCount}>{tracker?.filledCount ?? '-'}</FlashValue>
              </div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Failed</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                <FlashValue value={tracker?.failedCount}>{tracker?.failedCount ?? '-'}</FlashValue>
              </div>
            </Card>
            <Card padding="compact">
              <div className="text-xs text-slate-500">Total</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">
                <FlashValue value={tracker?.totalCount}>{tracker?.totalCount ?? '-'}</FlashValue>
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader title="Tracked Orders" />
            <DataTable
              columns={[
                { key: 'trackerId', header: 'Tracker ID' },
                { key: 'symbol', header: 'Symbol' },
                { key: 'side', header: 'Side', render: (r: any) => <span className={clsForSide(r.side)}>{r.side}</span> },
                { key: 'status', header: 'Status' },
                { key: 'quantity', header: 'Qty', align: 'right', render: (r: any) => fmtNumber(r.quantity, 4) }
              ]}
              rows={tracker?.trackers || []}
              density="compact"
              emptyTitle="No tracked orders"
            />
          </Card>
        </TabPanel>

        <TabPanel id="orders" activeId={activeTab}>
          <Card>
            <CardHeader title="Orders" />
            <DataTable
              columns={[
                { key: 'symbol', header: 'Symbol' },
                { key: 'side', header: 'Side', render: (r: any) => <span className={clsForSide(r.side)}>{r.side}</span> },
                { key: 'type', header: 'Type' },
                { key: 'quantity', header: 'Qty', align: 'right', render: (r: any) => fmtNumber(r.quantity, 4) },
                { key: 'status', header: 'Status' },
                { key: 'submittedAt', header: 'Submitted', render: (r: any) => fmtDateTime(r.submittedAt) }
              ]}
              rows={orders}
              density="compact"
              emptyTitle="No orders"
            />
          </Card>
        </TabPanel>

        <TabPanel id="positions" activeId={activeTab}>
          <Card>
            <CardHeader title="Positions" />
            <DataTable
              columns={[
                { key: 'symbol', header: 'Symbol' },
                { key: 'netQuantity', header: 'Net Qty', align: 'right', render: (r: any) => fmtNumber(r.netQuantity, 4) },
                { key: 'averageEntryPrice', header: 'Entry', align: 'right', render: (r: any) => fmtUsd(r.averageEntryPrice) },
                { key: 'lastMarkPrice', header: 'Mark', align: 'right', render: (r: any) => fmtUsd(r.lastMarkPrice) },
                { key: 'unrealizedPnl', header: 'Unrealized P&L', align: 'right', render: (r: any) => (
                  <span className={clsForPnl(r.unrealizedPnl)}>{fmtUsd(r.unrealizedPnl)}</span>
                )},
                { key: 'realizedPnl', header: 'Realized P&L', align: 'right', render: (r: any) => (
                  <span className={clsForPnl(r.realizedPnl)}>{fmtUsd(r.realizedPnl)}</span>
                )},
                { key: 'notional', header: 'Notional', align: 'right', render: (r: any) => fmtUsd(r.notional) }
              ]}
              rows={positions}
              density="compact"
              emptyTitle="No positions"
            />
          </Card>
        </TabPanel>

        <TabPanel id="executions" activeId={activeTab}>
          <Card>
            <CardHeader title="Executions" />
            <DataTable
              columns={[
                { key: 'symbol', header: 'Symbol' },
                { key: 'side', header: 'Side', render: (r: any) => <span className={clsForSide(r.side)}>{r.side}</span> },
                { key: 'quantity', header: 'Qty', align: 'right', render: (r: any) => fmtNumber(r.quantity, 4) },
                { key: 'feePaid', header: 'Fee', align: 'right', render: (r: any) => fmtUsd(r.feePaid) },
                { key: 'realizedPnlDelta', header: 'Realized P&L', align: 'right', render: (r: any) => (
                  <span className={clsForPnl(r.realizedPnlDelta)}>{fmtUsd(r.realizedPnlDelta)}</span>
                )},
                { key: 'createdAt', header: 'Time', render: (r: any) => fmtDateTime(r.createdAt) }
              ]}
              rows={execRows}
              density="compact"
              emptyTitle="No executions"
            />
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
