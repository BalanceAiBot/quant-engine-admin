import { hasToken, setToken, clearToken } from './api.js'
import { showToast, el } from './utils.js'

const pages = {
  dashboard: () => import('./pages/dashboard.js'),
  markets: () => import('./pages/markets.js'),
  trading: () => import('./pages/trading.js'),
  risk: () => import('./pages/risk.js'),
  accounts: () => import('./pages/accounts.js'),
  strategies: () => import('./pages/strategies.js')
}

let currentCleanup = null
let currentPage = ''

function init() {
  setupNav()
  setupTokenModal()
  window.addEventListener('hashchange', route)
  window.addEventListener('admin:unauthorized', () => {
    clearToken()
    showTokenModal()
    showToast('Session expired. Please enter control token.', 'error')
  })

  if (!hasToken()) {
    showTokenModal()
  } else {
    route()
  }
}

function setupNav() {
  const nav = document.getElementById('main-nav')
  if (!nav) return
  nav.querySelectorAll('a[data-page]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const page = link.getAttribute('data-page')
      window.location.hash = `#/${page}`
    })
  })
}

function route() {
  const hash = window.location.hash.replace('#/', '') || 'dashboard'
  const page = hash.split('/')[0]
  if (!pages[page]) {
    window.location.hash = '#/dashboard'
    return
  }
  loadPage(page)
  updateActiveNav(page)
}

async function loadPage(page) {
  if (currentCleanup) {
    currentCleanup()
    currentCleanup = null
  }
  currentPage = page
  const container = document.getElementById('page-content')
  if (!container) return
  container.innerHTML = '<div class="text-slate-400">Loading...</div>'
  try {
    const mod = await pages[page]()
    if (mod.mount) {
      currentCleanup = mod.mount(container) || (() => {})
    }
  } catch (e) {
    container.innerHTML = '<div class="text-rose-400">Failed to load page</div>'
  }
}

function updateActiveNav(page) {
  document.querySelectorAll('#main-nav a[data-page]').forEach((link) => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('bg-slate-800', 'text-slate-100')
      link.classList.remove('text-slate-400')
    } else {
      link.classList.remove('bg-slate-800', 'text-slate-100')
      link.classList.add('text-slate-400')
    }
  })
}

function setupTokenModal() {
  const modal = document.getElementById('token-modal')
  const input = document.getElementById('token-input')
  const btn = document.getElementById('token-save')
  if (!modal || !input || !btn) return

  btn.addEventListener('click', () => {
    const value = input.value.trim()
    if (value) {
      setToken(value)
      hideTokenModal()
      if (!currentPage) route()
      else loadPage(currentPage)
    }
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click()
  })
}

function showTokenModal() {
  const modal = document.getElementById('token-modal')
  if (modal) modal.classList.remove('hidden')
}

function hideTokenModal() {
  const modal = document.getElementById('token-modal')
  if (modal) modal.classList.add('hidden')
}

init()
