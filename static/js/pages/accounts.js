import { apiGet, apiPost } from '../api.js'
import { el, fmtNumber, fmtUsd, createTable, showToast, badgeClass } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  container.appendChild(el('h2', 'text-xl font-semibold mb-4', 'Accounts'))

  const accountSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  accountSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Binance Account'))
  container.appendChild(accountSection)

  const streamSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  streamSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'User Stream'))
  container.appendChild(streamSection)

  let intervalId = null

  async function load() {
    try {
      const [account, status] = await Promise.all([
        apiGet('/api/accounts/binance'),
        apiGet('/api/accounts/user-stream/status')
      ])
      renderAccount(accountSection, account.data)
      renderStream(streamSection, status.data)
    } catch (e) {
      // ignore polling errors
    }
  }

  load()
  intervalId = setInterval(load, 5000)

  return () => {
    if (intervalId) clearInterval(intervalId)
  }
}

function renderAccount(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)

  const env = el('div', 'text-xs text-slate-400 mb-2', `Environment: ${data.environment || '-'}`)
  container.appendChild(env)

  const spotCard = el('div', 'mb-3')
  spotCard.appendChild(el('div', 'text-sm font-medium text-slate-300 mb-1', 'Spot Balances'))
  spotCard.appendChild(createTable(
    [
      { label: 'Asset', key: 'asset' },
      { label: 'Free', key: 'free', align: 'right', render: (r) => fmtNumber(r.free, 6) },
      { label: 'Locked', key: 'locked', align: 'right', render: (r) => fmtNumber(r.locked, 6) },
      { label: 'Total', key: 'total', align: 'right', render: (r) => fmtNumber(r.total, 6) }
    ],
    data.spot?.balances || []
  ))
  container.appendChild(spotCard)

  const futCard = el('div')
  futCard.appendChild(el('div', 'text-sm font-medium text-slate-300 mb-1', `Futures • Wallet: ${fmtUsd(data.futures?.totalWalletBalance)} • Available: ${fmtUsd(data.futures?.availableBalance)}`))
  futCard.appendChild(createTable(
    [
      { label: 'Symbol', key: 'symbol' },
      { label: 'Amt', key: 'positionAmt', align: 'right', render: (r) => fmtNumber(r.positionAmt, 4) },
      { label: 'Entry', key: 'entryPrice', align: 'right', render: (r) => fmtUsd(r.entryPrice) },
      { label: 'Mark', key: 'markPrice', align: 'right', render: (r) => fmtUsd(r.markPrice) },
      { label: 'Notional', key: 'notional', align: 'right', render: (r) => fmtUsd(r.notional) }
    ],
    data.futures?.positions || []
  ))
  container.appendChild(futCard)
}

function renderStream(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)

  const controls = el('div', 'flex items-center gap-2 mb-3')
  const startBtn = el('button', 'px-3 py-1.5 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white', 'Start')
  const stopBtn = el('button', 'px-3 py-1.5 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white', 'Stop')
  const keepaliveBtn = el('button', 'px-3 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white', 'Keep Alive')
  startBtn.onclick = async () => {
    try {
      await apiPost('/api/accounts/user-stream/start', { instrumentKind: 'perpetual' })
      showToast('User stream started', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }
  stopBtn.onclick = async () => {
    try {
      await apiPost('/api/accounts/user-stream/stop', {})
      showToast('User stream stopped', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }
  keepaliveBtn.onclick = async () => {
    try {
      await apiPost('/api/accounts/user-stream/keepalive', { instrumentKind: 'perpetual', listenKey: data.listenKey || '' })
      showToast('Keepalive sent', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }
  controls.appendChild(startBtn)
  controls.appendChild(keepaliveBtn)
  controls.appendChild(stopBtn)
  container.appendChild(controls)

  const statusGrid = el('div', 'grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3')
  statusGrid.appendChild(infoItem('State', data.state, badgeClass(data.state)))
  statusGrid.appendChild(infoItem('Orders', String(data.orderUpdateCount || 0), ''))
  statusGrid.appendChild(infoItem('Accounts', String(data.accountUpdateCount || 0), ''))
  statusGrid.appendChild(infoItem('Listen Key', data.listenKey ? data.listenKey.slice(0, 8) + '...' : '-', ''))
  container.appendChild(statusGrid)

  if (data.recentOrders?.length) {
    const ordersCard = el('div', 'mb-3')
    ordersCard.appendChild(el('div', 'text-sm font-medium text-slate-300 mb-1', 'Recent Orders'))
    ordersCard.appendChild(createTable(
      [
        { label: 'Symbol', key: 'symbol' },
        { label: 'Side', key: 'side' },
        { label: 'Status', key: 'orderStatus' },
        { label: 'Filled', key: 'filledQuantity', align: 'right', render: (r) => fmtNumber(r.filledQuantity, 4) },
        { label: 'Avg Price', key: 'averagePrice', align: 'right', render: (r) => fmtUsd(r.averagePrice) }
      ],
      data.recentOrders
    ))
    container.appendChild(ordersCard)
  }

  if (data.positions?.length) {
    const posCard = el('div')
    posCard.appendChild(el('div', 'text-sm font-medium text-slate-300 mb-1', 'Positions'))
    posCard.appendChild(createTable(
      [
        { label: 'Symbol', key: 'symbol' },
        { label: 'Amt', key: 'positionAmt', align: 'right', render: (r) => fmtNumber(r.positionAmt, 4) },
        { label: 'Entry', key: 'entryPrice', align: 'right', render: (r) => fmtUsd(r.entryPrice) },
        { label: 'UPnL', key: 'unrealizedProfit', align: 'right', render: (r) => fmtUsd(r.unrealizedProfit) }
      ],
      data.positions
    ))
    container.appendChild(posCard)
  }
}

function infoItem(label, value, badgeCls) {
  const div = el('div', 'bg-slate-950 border border-slate-800 rounded p-2')
  div.appendChild(el('div', 'text-xs text-slate-400', label))
  if (badgeCls) {
    const badge = el('span', `inline-block mt-1 px-2 py-0.5 rounded text-xs ${badgeCls}`, value)
    div.appendChild(badge)
  } else {
    div.appendChild(el('div', 'text-slate-100 font-medium', value))
  }
  return div
}
