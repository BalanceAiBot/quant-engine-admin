import { apiGet, apiPost } from '../api.js'
import { el, fmtNumber, fmtUsd, createTable, showToast } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  container.appendChild(el('h2', 'text-xl font-semibold mb-4', 'Strategies'))

  const listSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  listSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Strategies & Presets'))
  container.appendChild(listSection)

  const backtestSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  backtestSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Backtest'))
  container.appendChild(backtestSection)

  const optimizeSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4')
  optimizeSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Optimize'))
  container.appendChild(optimizeSection)

  const resultSection = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  resultSection.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Result'))
  container.appendChild(resultSection)

  let strategies = []

  async function load() {
    try {
      const res = await apiGet('/api/strategies')
      strategies = res.data.strategies || []
      renderList(listSection, res.data)
      renderBacktest(backtestSection, strategies, resultSection)
      renderOptimize(optimizeSection, strategies, resultSection)
    } catch (e) {
      // ignore
    }
  }

  load()

  return () => {}
}

function renderList(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)

  const stratTable = createTable(
    [
      { label: 'ID', key: 'id' },
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' }
    ],
    data.strategies || []
  )
  container.appendChild(stratTable)

  if (data.presets?.length) {
    container.appendChild(el('div', 'text-sm font-medium text-slate-300 mt-4 mb-1', 'Presets'))
    container.appendChild(createTable(
      [
        { label: 'ID', key: 'id' },
        { label: 'Strategy', key: 'strategyId' },
        { label: 'Params', key: 'parameters', render: (r) => JSON.stringify(r.parameters) }
      ],
      data.presets
    ))
  }
}

function renderBacktest(container, strategies, resultContainer) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)

  const form = el('form', 'grid grid-cols-1 sm:grid-cols-5 gap-3')
  const strategySelect = el('select', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  strategies.forEach((s) => {
    const opt = el('option', '', s.id)
    opt.value = s.id
    strategySelect.appendChild(opt)
  })
  const entry = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  entry.placeholder = 'Entry bps'
  entry.type = 'number'
  const exit = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  exit.placeholder = 'Exit bps'
  exit.type = 'number'
  const size = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  size.placeholder = 'Size USD'
  size.type = 'number'
  const submit = el('button', 'px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white', 'Run')
  submit.type = 'submit'
  form.appendChild(strategySelect)
  form.appendChild(entry)
  form.appendChild(exit)
  form.appendChild(size)
  form.appendChild(submit)
  container.appendChild(form)

  form.onsubmit = async (e) => {
    e.preventDefault()
    const payload = { strategyId: strategySelect.value }
    const params = {}
    if (entry.value) params.entryThresholdBps = Number(entry.value)
    if (exit.value) params.exitThresholdBps = Number(exit.value)
    if (size.value) params.positionSizeUsd = Number(size.value)
    if (Object.keys(params).length) payload.parameters = params
    try {
      const res = await apiPost('/api/backtests/run', payload)
      renderResult(resultContainer, res.data)
      showToast('Backtest completed', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
}

function renderOptimize(container, strategies, resultContainer) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)

  const form = el('form', 'grid grid-cols-1 sm:grid-cols-5 gap-3')
  const strategySelect = el('select', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  strategies.forEach((s) => {
    const opt = el('option', '', s.id)
    opt.value = s.id
    strategySelect.appendChild(opt)
  })
  const objective = el('select', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  ;['netPnl', 'sharpeLike', 'maxDrawdownPct'].forEach((o) => {
    const opt = el('option', '', o)
    opt.value = o
    objective.appendChild(opt)
  })
  const entryMin = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  entryMin.placeholder = 'Entry min'
  entryMin.type = 'number'
  const entryMax = el('input', 'bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100')
  entryMax.placeholder = 'Entry max'
  entryMax.type = 'number'
  const submit = el('button', 'px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white', 'Run')
  submit.type = 'submit'
  form.appendChild(strategySelect)
  form.appendChild(objective)
  form.appendChild(entryMin)
  form.appendChild(entryMax)
  form.appendChild(submit)
  container.appendChild(form)

  form.onsubmit = async (e) => {
    e.preventDefault()
    const payload = {
      strategyId: strategySelect.value,
      objective: objective.value,
      parameterRanges: {}
    }
    if (entryMin.value && entryMax.value) {
      payload.parameterRanges.entryThresholdBps = {
        min: Number(entryMin.value),
        max: Number(entryMax.value),
        step: 10
      }
    }
    try {
      const res = await apiPost('/api/backtests/optimize', payload)
      renderResult(resultContainer, res.data)
      showToast('Optimization completed', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
}

function renderResult(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  const pre = el('pre', 'text-xs text-slate-400 overflow-x-auto')
  pre.textContent = JSON.stringify(data, null, 2)
  container.appendChild(pre)
}
