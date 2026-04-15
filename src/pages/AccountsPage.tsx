import { useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { DataTable } from '../components/DataTable'
import { showToast } from '../components/ToastContainer'
import { fmtNumber, fmtUsd, fmtDateTime, badgeClass } from '../lib/utils'

export function AccountsPage() {
  const [account, setAccount] = useState<any>(null)
  const [stream, setStream] = useState<any>(null)
  const [tradingRules, setTradingRules] = useState<any>(null)
  const [streamOrders, setStreamOrders] = useState<any[]>([])
  const [streamAccounts, setStreamAccounts] = useState<any[]>([])

  usePolling(async () => {
    const [aRes, sRes, tRes, oRes, acRes] = await Promise.all([
      apiGet('/api/accounts/binance'),
      apiGet('/api/accounts/user-stream/status'),
      apiGet('/api/accounts/binance/trading-rules'),
      apiGet('/api/accounts/user-stream/orders'),
      apiGet('/api/accounts/user-stream/accounts')
    ])
    setAccount(aRes.data)
    setStream(sRes.data)
    setTradingRules(tRes.data)
    setStreamOrders(oRes.data || [])
    setStreamAccounts(acRes.data || [])
  }, 5000)

  const handleStart = async () => {
    try {
      await apiPost('/api/accounts/user-stream/start', { instrumentKind: 'perpetual' })
      showToast('User stream started', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleStop = async () => {
    try {
      await apiPost('/api/accounts/user-stream/stop', {})
      showToast('User stream stopped', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleKeepAlive = async () => {
    try {
      await apiPost('/api/accounts/user-stream/keepalive', {
        instrumentKind: 'perpetual',
        listenKey: stream?.listenKey || ''
      })
      showToast('Keepalive sent', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Accounts</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Binance Account</h3>
        <div className="text-xs text-slate-400 mb-2">Environment: {account?.environment || '-'}</div>

        <div className="mb-3">
          <div className="text-sm font-medium text-slate-300 mb-1">Spot Balances</div>
          <DataTable
            columns={[
              { label: 'Asset', key: 'asset' },
              { label: 'Free', key: 'free', align: 'right', render: (r: any) => fmtNumber(r.free, 6) },
              { label: 'Locked', key: 'locked', align: 'right', render: (r: any) => fmtNumber(r.locked, 6) },
              { label: 'Total', key: 'total', align: 'right', render: (r: any) => fmtNumber(r.total, 6) }
            ]}
            rows={account?.spot?.balances || []}
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-300 mb-1">
            Futures • Wallet: {fmtUsd(account?.futures?.totalWalletBalance)} • Available: {fmtUsd(account?.futures?.availableBalance)}
          </div>
          <DataTable
            columns={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Amt', key: 'positionAmt', align: 'right', render: (r: any) => fmtNumber(r.positionAmt, 4) },
              { label: 'Entry', key: 'entryPrice', align: 'right', render: (r: any) => fmtUsd(r.entryPrice) },
              { label: 'Mark', key: 'markPrice', align: 'right', render: (r: any) => fmtUsd(r.markPrice) },
              { label: 'Notional', key: 'notional', align: 'right', render: (r: any) => fmtUsd(r.notional) }
            ]}
            rows={account?.futures?.positions || []}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Trading Rules</h3>
        <div className="text-xs text-slate-400 mb-2">
          Symbols: {tradingRules?.symbols?.length || 0}
        </div>
        <DataTable
          columns={[
            { label: 'Symbol', key: 'symbol' },
            { label: 'Status', key: 'status' },
            { label: 'Min Qty', key: 'minQty', align: 'right', render: (r: any) => fmtNumber(r.minQty, 6) },
            { label: 'Max Qty', key: 'maxQty', align: 'right', render: (r: any) => fmtNumber(r.maxQty, 4) },
            { label: 'Step', key: 'stepSize', align: 'right', render: (r: any) => fmtNumber(r.stepSize, 6) },
            { label: 'Min Notional', key: 'minNotional', align: 'right', render: (r: any) => fmtUsd(r.minNotional) }
          ]}
          rows={tradingRules?.symbols?.slice(0, 20) || []}
          emptyText="No trading rules"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">User Stream</h3>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={handleStart} className="px-3 py-1.5 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white">Start</button>
          <button onClick={handleKeepAlive} className="px-3 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white">Keep Alive</button>
          <button onClick={handleStop} className="px-3 py-1.5 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white">Stop</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
          <InfoItem label="State" value={stream?.state} badgeClass={badgeClass(stream?.state)} />
          <InfoItem label="Orders" value={String(stream?.orderUpdateCount || 0)} />
          <InfoItem label="Accounts" value={String(stream?.accountUpdateCount || 0)} />
          <InfoItem label="Listen Key" value={stream?.listenKey ? stream.listenKey.slice(0, 8) + '...' : '-'} />
        </div>

        {stream?.recentOrders?.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-slate-300 mb-1">Recent Orders</div>
            <DataTable
              columns={[
                { label: 'Symbol', key: 'symbol' },
                { label: 'Side', key: 'side' },
                { label: 'Status', key: 'orderStatus' },
                { label: 'Filled', key: 'filledQuantity', align: 'right', render: (r: any) => fmtNumber(r.filledQuantity, 4) },
                { label: 'Avg Price', key: 'averagePrice', align: 'right', render: (r: any) => fmtUsd(r.averagePrice) }
              ]}
              rows={stream.recentOrders}
            />
          </div>
        )}

        {stream?.positions?.length > 0 && (
          <div>
            <div className="text-sm font-medium text-slate-300 mb-1">Positions</div>
            <DataTable
              columns={[
                { label: 'Symbol', key: 'symbol' },
                { label: 'Amt', key: 'positionAmt', align: 'right', render: (r: any) => fmtNumber(r.positionAmt, 4) },
                { label: 'Entry', key: 'entryPrice', align: 'right', render: (r: any) => fmtUsd(r.entryPrice) },
                { label: 'UPnL', key: 'unrealizedProfit', align: 'right', render: (r: any) => fmtUsd(r.unrealizedProfit) }
              ]}
              rows={stream.positions}
            />
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">User Stream Orders</h3>
        <DataTable
          columns={[
            { label: 'Symbol', key: 'symbol' },
            { label: 'Side', key: 'side' },
            { label: 'Status', key: 'orderStatus' },
            { label: 'Filled', key: 'filledQuantity', align: 'right', render: (r: any) => fmtNumber(r.filledQuantity, 4) },
            { label: 'Avg Price', key: 'averagePrice', align: 'right', render: (r: any) => fmtUsd(r.averagePrice) }
          ]}
          rows={streamOrders}
          emptyText="No stream orders"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">User Stream Account Events</h3>
        <DataTable
          columns={[
            { label: 'Event Time', key: 'eventTime', render: (r: any) => fmtDateTime(r.eventTime) },
            { label: 'Type', key: 'eventType' },
            { label: 'Assets', key: 'balances', render: (r: any) => String(r.balances?.length || 0) }
          ]}
          rows={streamAccounts}
          emptyText="No stream account events"
        />
      </div>
    </div>
  )
}

function InfoItem({ label, value, badgeClass }: { label: string; value: string; badgeClass?: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded p-2">
      <div className="text-xs text-slate-400">{label}</div>
      {badgeClass ? (
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${badgeClass}`}>{value}</span>
      ) : (
        <div className="text-slate-100 font-medium">{value}</div>
      )}
    </div>
  )
}
