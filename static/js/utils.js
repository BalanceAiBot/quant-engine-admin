export function fmtNumber(n, digits = 4) {
  if (n === undefined || n === null) return '-'
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  })
}

export function fmtUsd(n) {
  if (n === undefined || n === null) return '-'
  const s = Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `$${s}`
}

export function fmtBps(n) {
  if (n === undefined || n === null) return '-'
  return `${fmtNumber(n, 2)} bps`
}

export function fmtPct(n) {
  if (n === undefined || n === null) return '-'
  return `${fmtNumber(n * 100, 4)}%`
}

export function fmtTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour12: false })
}

export function fmtDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('en-US', { hour12: false })
}

export function clsForPnl(n) {
  if (n === undefined || n === null) return 'text-slate-300'
  return n >= 0 ? 'text-emerald-400' : 'text-rose-400'
}

export function clsForSide(side) {
  if (side === 'buy') return 'text-emerald-400'
  if (side === 'sell') return 'text-rose-400'
  return 'text-slate-300'
}

export function badgeClass(state) {
  const map = {
    idle: 'bg-slate-700 text-slate-200',
    starting: 'bg-amber-600/30 text-amber-400',
    running: 'bg-emerald-600/30 text-emerald-400',
    stopping: 'bg-amber-600/30 text-amber-400',
    stopped: 'bg-slate-700 text-slate-200',
    error: 'bg-rose-600/30 text-rose-400',
    open: 'bg-emerald-600/30 text-emerald-400',
    closed: 'bg-slate-700 text-slate-200',
    connecting: 'bg-amber-600/30 text-amber-400',
    reconnecting: 'bg-amber-600/30 text-amber-400',
    paper: 'bg-emerald-600/30 text-emerald-400',
    live: 'bg-rose-600/30 text-rose-400',
    readonly: 'bg-blue-600/30 text-blue-400'
  }
  return map[state] || 'bg-slate-700 text-slate-200'
}

export function el(tag, classes = '', text = '') {
  const e = document.createElement(tag)
  if (classes) e.className = classes
  if (text) e.textContent = text
  return e
}

export function createTable(headers, rows, emptyText = 'No data') {
  if (!rows || rows.length === 0) {
    return el('div', 'text-sm text-slate-400 py-4', emptyText)
  }
  const wrap = el('div', 'overflow-x-auto')
  const table = el('table', 'w-full text-left text-sm border-collapse')
  const thead = el('thead', 'text-slate-400 border-b border-slate-800')
  const trh = el('tr')
  headers.forEach((h) => {
    const th = el('th', 'py-2 pr-4 font-medium whitespace-nowrap', h.label)
    if (h.align) th.style.textAlign = h.align
    trh.appendChild(th)
  })
  thead.appendChild(trh)
  table.appendChild(thead)
  const tbody = el('tbody', 'divide-y divide-slate-800')
  rows.forEach((row) => {
    const tr = el('tr', 'hover:bg-slate-800/50')
    headers.forEach((h) => {
      const td = el('td', 'py-2 pr-4 whitespace-nowrap')
      const value = typeof h.key === 'function' ? h.key(row) : row[h.key]
      if (h.render) {
        const content = h.render(row)
        if (typeof content === 'string') {
          td.textContent = content
        } else {
          td.appendChild(content)
        }
      } else {
        td.textContent = value ?? '-'
      }
      if (h.align) td.style.textAlign = h.align
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)
  wrap.appendChild(table)
  return wrap
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return
  const toast = el('div', 'px-4 py-2 rounded shadow text-sm transition-opacity duration-300', message)
  if (type === 'error') toast.className += ' bg-rose-600 text-white'
  else if (type === 'success') toast.className += ' bg-emerald-600 text-white'
  else toast.className += ' bg-slate-700 text-slate-100'
  container.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
