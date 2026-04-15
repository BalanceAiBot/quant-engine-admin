import { apiGet, apiPost } from '../api.js'
import { el, fmtNumber, fmtBps, fmtPct, fmtUsd, badgeClass, createTable, showToast } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  container.appendChild(el('h2', 'text-xl font-semibold mb-4', 'Markets'))

  const runtimeSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  container.appendChild(runtimeSection)

  const universeSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  universeSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Universe'))
  container.appendChild(universeSection)

  const featuresSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  featuresSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Features'))
  container.appendChild(featuresSection)

  let intervalId = null

  async function load() {
    try {
      const [runtime, universe, features] = await Promise.all([
        apiGet('/api/markets/runtime'),
        apiGet('/api/markets/universe'),
        apiGet('/api/markets/features?limit=50')
      ])
      renderRuntime(runtimeSection, runtime.data)
      renderUniverse(universeSection, universe.data)
      renderFeatures(featuresSection, features.data)
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

function renderRuntime(container, data) {
  container.innerHTML = ''
  const header = el('div', 'flex items-center justify-between mb-3')
  header.appendChild(el('h3', 'text-sm font-medium text-slate-300', 'Market Runtime'))
  const badge = el('span', `px-2 py-0.5 rounded text-xs ${badgeClass(data.status.state)}`, data.status.state)
  header.appendChild(badge)
  container.appendChild(header)

  const controls = el('div', 'flex items-center gap-2 mb-3')
  const startBtn = el('button', 'px-3 py-1.5 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white', 'Start')
  const stopBtn = el('button', 'px-3 py-1.5 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white', 'Stop')
  startBtn.onclick = async () => {
    try {
      await apiPost('/api/markets/runtime/start', { source: 'sample' })
      showToast('Runtime started', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }
  stopBtn.onclick = async () => {
    try {
      await apiPost('/api/markets/runtime/stop', {})
      showToast('Runtime stopped', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }
  controls.appendChild(startBtn)
  controls.appendChild(stopBtn)
  container.appendChild(controls)

  const connHeader = el('div', 'text-xs text-slate-400 mb-2', `Connections (${data.status.connections?.length || 0})`)
  container.appendChild(connHeader)

  if (data.status.connections?.length) {
    const connList = el('div', 'space-y-2')
    data.status.connections.forEach((c) => {
      const row = el('div', 'flex items-center justify-between text-sm border-b border-slate-800 pb-1')
      row.appendChild(el('span', 'text-slate-300', `${c.connectionId} • ${c.instrumentKind}`))
      row.appendChild(el('span', `text-xs px-2 py-0.5 rounded ${badgeClass(c.state)}`, c.state))
      connList.appendChild(row)
    })
    container.appendChild(connList)
  }
}

function renderUniverse(container, data) {
  // keep header
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  const info = el('div', 'text-xs text-slate-400 mb-2', `Source: ${data.source} • Pairs: ${data.pairs?.length || 0} • Streams: ${data.stats?.streamCount || 0}`)
  container.appendChild(info)
  const table = createTable(
    [
      { label: 'Base', key: 'baseAsset' },
      { label: 'Spot', key: 'spotSymbol' },
      { label: 'Perp', key: 'perpetualSymbol' },
      { label: 'Volume', key: 'combinedQuoteVolume', align: 'right', render: (r) => fmtUsd(r.combinedQuoteVolume) }
    ],
    data.pairs || []
  )
  container.appendChild(table)
}

function renderFeatures(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  const table = createTable(
    [
      { label: 'Base', key: 'baseAsset' },
      { label: 'Spot', key: 'spotLastPrice', align: 'right', render: (r) => fmtUsd(r.spotLastPrice) },
      { label: 'Perp', key: 'perpetualLastPrice', align: 'right', render: (r) => fmtUsd(r.perpetualLastPrice) },
      { label: 'Mark', key: 'markPrice', align: 'right', render: (r) => fmtUsd(r.markPrice) },
      { label: 'Basis', key: 'basisBps', align: 'right', render: (r) => fmtBps(r.basisBps) },
      { label: 'Funding', key: 'fundingRate', align: 'right', render: (r) => fmtPct(r.fundingRate) }
    ],
    data || []
  )
  container.appendChild(table)
}
