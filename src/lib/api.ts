const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '')

function getToken() {
  return sessionStorage.getItem('controlToken') || ''
}

export function setToken(token: string) {
  sessionStorage.setItem('controlToken', token)
}

export function hasToken() {
  return !!getToken()
}

export function clearToken() {
  sessionStorage.removeItem('controlToken')
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'x-control-token': getToken()
    }
  })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('admin:unauthorized'))
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}

export async function apiPost(path: string, payload: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-control-token': getToken()
    },
    body: JSON.stringify(payload)
  })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('admin:unauthorized'))
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}

export async function apiPut(path: string, payload: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-control-token': getToken()
    },
    body: JSON.stringify(payload)
  })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('admin:unauthorized'))
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'x-control-token': getToken()
    }
  })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('admin:unauthorized'))
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}
