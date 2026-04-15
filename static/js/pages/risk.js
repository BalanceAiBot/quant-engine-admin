import { apiGet } from '../api.js'
import { el, createTable, badgeClass } from '../utils.js'

export function mount(container) {
  container.innerHTML = ''
  container.appendChild(el('h2', 'text-xl font-semibold mb-4', 'Risk'))

  const section = el('div', 'bg-slate-900 border border-slate-800 rounded-lg p-4')
  section.appendChild(el('h3', 'text-sm font-medium text-slate-300 mb-3', 'Protections'))
  container.appendChild(section)

  let intervalId = null

  async function load() {
    try {
      const res = await apiGet('/api/risk/protections')
      renderProtections(section, res.data)
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

function renderProtections(container, data) {
  const header = container.querySelector('h3')
  container.innerHTML = ''
  container.appendChild(header)
  container.appendChild(createTable(
    [
      { label: 'Protection', key: 'protectionId' },
      { label: 'Enabled', key: 'enabled', render: (r) => {
        const span = el('span', r.enabled ? 'text-emerald-400' : 'text-rose-400', r.enabled ? 'Yes' : 'No')
        return span
      }}
    ],
    data || []
  ))
}
