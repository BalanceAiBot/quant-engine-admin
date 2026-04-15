import { apiGet } from '../api.js'
import { el, fmtNumber, fmtUsd, fmtDateTime, badgeClass } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  const title = el('h2', 'text-xl font-semibold mb-4', 'Dashboard')
  container.appendChild(title)

  const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6')
  container.appendChild(grid)

  const bottom = el('div', 'grid grid-cols-1 lg:grid-cols-2 gap-4')
  container.appendChild(bottom)

  let intervalId = null

  async function load() {
    try {
      const [summary, orders, executions] = await Promise.all([
        apiGet('/api/system/summary'),
        apiGet('/api/orders'),
        apiGet('/api/orders/executions')
      ])
      const data = summary.data
      const mode = data.mode
      const runtime = data.marketRuntime
      const openOrders = (orders.data || []).filter((o) => o.status === 'pending').length
      const pairCount = runtime.universePairCount || 0

      grid.innerHTML = ''
      grid.appendChild(kpiCard('Mode', mode, badgeClass(mode)))
      grid.appendChild(kpiCard('Market Runtime', runtime.state, badgeClass(runtime.state)))
      grid.appendChild(kpiCard('Active Pairs', String(pairCount), ''))
      grid.appendChild(kpiCard('Open Orders', String(openOrders), ''))

      bottom.innerHTML = ''
      bottom.appendChild(recentExecutionsCard(executions.data || []))
      bottom.appendChild(summaryCard(data))
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

function kpiCard(label, value, badgeCls) {
  const card = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  const lbl = el('div', 'text-slate-400 text-sm mb-1', label)
  const val = el('div', 'text-2xl font-bold text-slate-100', value)
  if (badgeCls) {
    const badge = el('span', `inline-block mt-2 px-2 py-0.5 rounded text-xs ${badgeCls}`, value)
    val.textContent = ''
    val.appendChild(badge)
  }
  card.appendChild(lbl)
  card.appendChild(val)
  return card
}

function recentExecutionsCard(list) {
  const card = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  card.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Recent Executions'))
  if (!list.length) {
    card.appendChild(el('div', 'text-sm text-slate-500', 'No executions yet'))
    return card
  }
  const table = el('table', 'w-full text-left text-sm')
  const thead = el('thead', 'text-slate-400')
  const trh = el('tr')
  ;['Symbol', 'Side', 'Qty', 'Fee', 'Realized PnL', 'Time'].forEach((t) => trh.appendChild(el('th', 'py-1 pr-3 font-medium', t)))
  thead.appendChild(trh)
  table.appendChild(thead)
  const tbody = el('tbody', 'divide-y divide-slate-800')
  list.slice(0, 5).forEach((ex) => {
    const tr = el('tr')
    const report = ex.payload || ex
    const order = report.order || {}
    const pnl = report.realizedPnlDelta || 0
    const cells = [
      order.symbol || '-',
      order.side || '-',
      fmtNumber(order.quantity, 4),
      fmtUsd(report.feePaid || 0),
      fmtUsd(pnl),
      fmtDateTime(ex.createdAt || order.submittedAt)
    ]
    cells.forEach((c, i) => {
      const td = el('td', 'py-1 pr-3')
      if (i === 4) td.className += ` ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`
      td.textContent = c
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)
  card.appendChild(table)
  return card
}

function summaryCard(data) {
  const card = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  card.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'System Summary'))
  const pre = el('pre', 'text-xs text-slate-400 overflow-x-auto')
  pre.textContent = JSON.stringify(data, null, 2)
  card.appendChild(pre)
  return card
}
