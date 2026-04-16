import { useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { Card, CardHeader } from '../components/ui/Card'
import { DataTable } from '../components/composite/DataTable'
import { PageHeader } from '../components/composite/PageHeader'
import { Tabs, TabPanel } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { showToast } from '../components/ToastContainer'
import { fmtNumber, fmtUsd, fmtDateTime } from '../lib/utils'

export function AccountsPage() {
  const [account, setAccount] = useState<any>(null)
  const [stream, setStream] = useState<any>(null)
  const [tradingRules, setTradingRules] = useState<any>(null)
  const [streamOrders, setStreamOrders] = useState<any[]>([])
  const [streamAccounts, setStreamAccounts] = useState<any[]>([])
  const [credentials, setCredentials] = useState<any>(null)
  const [credApiKey, setCredApiKey] = useState('')
  const [credApiSecret, setCredApiSecret] = useState('')
  const [activeTab, setActiveTab] = useState('balances')

  usePolling(async () => {
    const [aRes, sRes, tRes, oRes, acRes, cRes] = await Promise.all([
      apiGet('/api/accounts/binance'),
      apiGet('/api/accounts/user-stream/status'),
      apiGet('/api/accounts/binance/trading-rules'),
      apiGet('/api/accounts/user-stream/orders'),
      apiGet('/api/accounts/user-stream/accounts'),
      apiGet('/api/accounts/binance/credentials')
    ])
    setAccount(aRes.data)
    setStream(sRes.data)
    setTradingRules(tRes.data)
    setStreamOrders(oRes.data || [])
    setStreamAccounts(acRes.data || [])
    setCredentials(cRes.data)
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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPut('/api/accounts/binance/credentials', {
        apiKey: credApiKey,
        apiSecret: credApiSecret
      })
      showToast('Credentials saved', 'success')
      setCredApiKey('')
      setCredApiSecret('')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const handleDeleteCredentials = async () => {
    try {
      await apiDelete('/api/accounts/binance/credentials')
      showToast('Credentials deleted', 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Exchange accounts, balances, and credentials"
      />

      <Tabs
        tabs={[
          { id: 'balances', label: 'Balances' },
          { id: 'stream', label: 'Stream' },
          { id: 'rules', label: 'Trading Rules' },
          { id: 'credentials', label: 'Credentials' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel id="balances" activeId={activeTab}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Spot Balances"
                subtitle={`Environment: ${account?.environment || '-'}`}
              />
              <DataTable
                columns={[
                  { key: 'asset', header: 'Asset' },
                  { key: 'free', header: 'Free', align: 'right', render: (r: any) => fmtNumber(r.free, 6) },
                  { key: 'locked', header: 'Locked', align: 'right', render: (r: any) => fmtNumber(r.locked, 6) },
                  { key: 'total', header: 'Total', align: 'right', render: (r: any) => fmtNumber(r.total, 6) }
                ]}
                rows={account?.spot?.balances || []}
                density="compact"
                emptyTitle="No spot balances"
              />
            </Card>

            <Card>
              <CardHeader
                title="Futures Positions"
                subtitle={`Wallet: ${fmtUsd(account?.futures?.totalWalletBalance)} • Available: ${fmtUsd(account?.futures?.availableBalance)}`}
              />
              <DataTable
                columns={[
                  { key: 'symbol', header: 'Symbol' },
                  { key: 'positionAmt', header: 'Amt', align: 'right', render: (r: any) => fmtNumber(r.positionAmt, 4) },
                  { key: 'entryPrice', header: 'Entry', align: 'right', render: (r: any) => fmtUsd(r.entryPrice) },
                  { key: 'markPrice', header: 'Mark', align: 'right', render: (r: any) => fmtUsd(r.markPrice) },
                  { key: 'notional', header: 'Notional', align: 'right', render: (r: any) => fmtUsd(r.notional) }
                ]}
                rows={account?.futures?.positions || []}
                density="compact"
                emptyTitle="No futures positions"
              />
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="stream" activeId={activeTab}>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant={stream?.state === 'running' ? 'success' : 'default'} dot>
              {stream?.state || 'idle'}
            </Badge>
            <div className="text-sm text-slate-400">
              Orders: {stream?.orderUpdateCount || 0} • Accounts: {stream?.accountUpdateCount || 0}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleStart}>Start</Button>
              <Button variant="secondary" size="sm" onClick={handleKeepAlive}>Keep Alive</Button>
              <Button variant="danger" size="sm" onClick={handleStop}>Stop</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {stream?.recentOrders?.length > 0 && (
              <Card>
                <CardHeader title="Recent Orders" />
                <DataTable
                  columns={[
                    { key: 'symbol', header: 'Symbol' },
                    { key: 'side', header: 'Side' },
                    { key: 'orderStatus', header: 'Status' },
                    { key: 'filledQuantity', header: 'Filled', align: 'right', render: (r: any) => fmtNumber(r.filledQuantity, 4) },
                    { key: 'averagePrice', header: 'Avg Price', align: 'right', render: (r: any) => fmtUsd(r.averagePrice) }
                  ]}
                  rows={stream.recentOrders}
                  density="compact"
                  emptyTitle="No recent orders"
                />
              </Card>
            )}

            {stream?.positions?.length > 0 && (
              <Card>
                <CardHeader title="Positions" />
                <DataTable
                  columns={[
                    { key: 'symbol', header: 'Symbol' },
                    { key: 'positionAmt', header: 'Amt', align: 'right', render: (r: any) => fmtNumber(r.positionAmt, 4) },
                    { key: 'entryPrice', header: 'Entry', align: 'right', render: (r: any) => fmtUsd(r.entryPrice) },
                    { key: 'unrealizedProfit', header: 'UPnL', align: 'right', render: (r: any) => fmtUsd(r.unrealizedProfit) }
                  ]}
                  rows={stream.positions}
                  density="compact"
                  emptyTitle="No positions"
                />
              </Card>
            )}

            <Card>
              <CardHeader title="User Stream Orders" />
              <DataTable
                columns={[
                  { key: 'symbol', header: 'Symbol' },
                  { key: 'side', header: 'Side' },
                  { key: 'orderStatus', header: 'Status' },
                  { key: 'filledQuantity', header: 'Filled', align: 'right', render: (r: any) => fmtNumber(r.filledQuantity, 4) },
                  { key: 'averagePrice', header: 'Avg Price', align: 'right', render: (r: any) => fmtUsd(r.averagePrice) }
                ]}
                rows={streamOrders}
                density="compact"
                emptyTitle="No stream orders"
              />
            </Card>

            <Card>
              <CardHeader title="User Stream Account Events" />
              <DataTable
                columns={[
                  { key: 'eventTime', header: 'Event Time', render: (r: any) => fmtDateTime(r.eventTime) },
                  { key: 'eventType', header: 'Type' },
                  { key: 'balances', header: 'Assets', render: (r: any) => String(r.balances?.length || 0) }
                ]}
                rows={streamAccounts}
                density="compact"
                emptyTitle="No stream account events"
              />
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="rules" activeId={activeTab}>
          <Card>
            <CardHeader
              title="Trading Rules"
              subtitle={`Symbols: ${tradingRules?.symbols?.length || 0}`}
            />
            <DataTable
              columns={[
                { key: 'symbol', header: 'Symbol' },
                { key: 'status', header: 'Status' },
                { key: 'minQty', header: 'Min Qty', align: 'right', render: (r: any) => fmtNumber(r.minQty, 6) },
                { key: 'maxQty', header: 'Max Qty', align: 'right', render: (r: any) => fmtNumber(r.maxQty, 4) },
                { key: 'stepSize', header: 'Step', align: 'right', render: (r: any) => fmtNumber(r.stepSize, 6) },
                { key: 'minNotional', header: 'Min Notional', align: 'right', render: (r: any) => fmtUsd(r.minNotional) }
              ]}
              rows={tradingRules?.symbols?.slice(0, 50) || []}
              density="compact"
              emptyTitle="No trading rules"
            />
          </Card>
        </TabPanel>

        <TabPanel id="credentials" activeId={activeTab}>
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader
                title="Binance Credentials"
                subtitle={credentials?.lastUpdatedAt ? `Last updated: ${fmtDateTime(credentials.lastUpdatedAt)}` : undefined}
              />
              <div className="mb-4 flex items-center gap-2 text-sm">
                <span className="text-slate-400">Configured:</span>
                <Badge variant={credentials?.hasCredentials ? 'success' : 'default'} dot>
                  {credentials?.hasCredentials ? 'Yes' : 'No'}
                </Badge>
              </div>
              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={credApiKey}
                    onChange={(e) => setCredApiKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    placeholder="API Secret"
                    value={credApiSecret}
                    onChange={(e) => setCredApiSecret(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" variant="primary">Save</Button>
                  <Button type="button" variant="danger" onClick={handleDeleteCredentials}>Delete</Button>
                </div>
              </form>
            </Card>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}
