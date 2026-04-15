import { apiGet, apiPost } from '../api.js'
import { el, fmtNumber, fmtUsd, fmtDateTime, clsForPnl, clsForSide, createTable, showToast } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  container.appendChild(el('h2', 'text-xl font-semibold mb-4', 'Trading'))

  const paperForm = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4 hidden')
  paperForm.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Paper Order'))
  container.appendChild(paperForm)

  const ordersSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  ordersSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Orders'))
  container.appendChild(ordersSection)

  const positionsSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  positionsSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Positions'))
  container.appendChild(positionsSection)

  const execSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  execSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Executions'))
  container.appendChild(execSection)

  let intervalId = null
  let isPaper = false

  async function load() {
    try {
      const [summary, orders, positions, executions] = await Promise.all([
        apiGet('/api/system/summary'),
        apiGet('/api/orders'),
        apiGet('/api/positions'),
        apiGet('/api/orders/executions')
      ])
      isPaper = summary.data.mode === 'paper'
      if (isPaper) {
        paperForm.classList.remove('hidden')
        renderPaperForm(paperForm)
      } else {
        paperForm.classList.add('hidden')
        paperForm.innerHTML = ''
        paperForm.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Paper Order'))
      }
      renderOrders(ordersSection, orders.data)
      renderPositions(positionsSection, positions.data)
      renderExecutions(execSection, executions.data)
    } catch (e) {
      // ignore
    }
  }

  load()
  intervalId = setInterval(load, 5000)

  return () => {
    if (intervalId) clearInterval(intervalId)
  }
}

function renderPaperForm(container) {
  if (container.querySelector('form')) return
  const form = el('form', 'grid grid-cols-1 sm:grid-cols-4 gap-3')
  const symbol = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  symbol.placeholder = 'Symbol (e.g. BTCUSDT)'
  const side = el('select', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  ;['buy', 'sell'].forEach((s) => {
    const opt = el('option', '', s)
    opt.value = s
    side.appendChild(opt)
  })
  const qty = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  qty.placeholder = 'Quantity'
  qty.type = 'number'
  qty.step = 'any'
  const submit = el('button', 'px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white', 'Submit')
  submit.type = 'submit'
  form.appendChild(symbol)
  form.appendChild(side)
  form.appendChild(qty)
  form.appendChild(submit)
  container.appendChild(form)

  form.onsubmit = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/api/orders/paper', {
        strategyId: 'admin-ui',
        symbol: symbol.value,
        instrumentKind: 'perpetual',
        side: side.value,
        type: 'market',
        quantity: Number(qty.value)
      })
      showToast('Paper order submitted', 'success')
      symbol.value = ''
      qty.value = ''
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
}

function renderOrders(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  container.appendChild(createTable(
    [
      { label: 'Symbol', key: 'symbol' },
      { label: 'Side', key: 'side', render: (r) => r.side },
      { label: 'Type', key: 'type' },
      { label: 'Qty', key: 'quantity', align: 'right', render: (r) => fmtNumber(r.quantity, 4) },
      { label: 'Status', key: 'status' },
      { label: 'Submitted', key: 'submittedAt', render: (r) => fmtDateTime(r.submittedAt) }
    ],
    data || []
  ))
}

function renderPositions(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  container.appendChild(createTable(
    [
      { label: 'Symbol', key: 'symbol' },
      { label: 'Net Qty', key: 'netQuantity', align: 'right', render: (r) => fmtNumber(r.netQuantity, 4) },
      { label: 'Entry', key: 'averageEntryPrice', align: 'right', render: (r) => fmtUsd(r.averageEntryPrice) },
      { label: 'Mark', key: 'lastMarkPrice', align: 'right', render: (r) => fmtUsd(r.lastMarkPrice) },
      { label: 'Unrealized', key: 'unrealizedPnl', align: 'right', render: (r) => {
        const span = el('span', clsForPnl(r.unrealizedPnl), fmtUsd(r.unrealizedPnl))
        return span
      }},
      { label: 'Realized', key: 'realizedPnl', align: 'right', render: (r) => {
        const span = el('span', clsForPnl(r.realizedPnl), fmtUsd(r.realizedPnl))
        return span
      }},
      { label: 'Notional', key: 'notional', align: 'right', render: (r) => fmtUsd(r.notional) }
    ],
    data || []
  ))
}

function renderExecutions(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  const rows = (data || []).map((ex) => {
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
  container.appendChild(createTable(
    [
      { label: 'Symbol', key: 'symbol' },
      { label: 'Side', key: 'side', render: (r) => r.side },
      { label: 'Qty', key: 'quantity', align: 'right', render: (r) => fmtNumber(r.quantity, 4) },
      { label: 'Fee', key: 'feePaid', align: 'right', render: (r) => fmtUsd(r.feePaid) },
      { label: 'Realized PnL', key: 'realizedPnlDelta', align: 'right', render: (r) => {
        const span = el('span', clsForPnl(r.realizedPnlDelta), fmtUsd(r.realizedPnlDelta))
        return span
      }},
      { label: 'Time', key: 'createdAt', render: (r) => fmtDateTime(r.createdAt) }
    ],
    rows
  ))
}
