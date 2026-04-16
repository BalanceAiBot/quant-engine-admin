const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '')

function getBearerToken() {
  return sessionStorage.getItem('bearerToken') || ''
}

function getControlToken() {
  return sessionStorage.getItem('controlToken') || ''
}

export function setBearerToken(token: string) {
  sessionStorage.setItem('bearerToken', token)
}

export function setControlToken(token: string) {
  sessionStorage.setItem('controlToken', token)
}

export function hasToken() {
  return !!getBearerToken() || !!getControlToken()
}

export function clearTokens() {
  sessionStorage.removeItem('bearerToken')
  sessionStorage.removeItem('controlToken')
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const bearer = getBearerToken()
  const control = getControlToken()
  if (bearer) {
    headers['authorization'] = `Bearer ${bearer}`
  }
  if (control) {
    headers['x-control-token'] = control
  }
  return headers
}

function handleUnauthorized() {
  clearTokens()
  window.dispatchEvent(new CustomEvent('admin:unauthorized'))
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {})
    }
  })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}

export async function apiGet(path: string) {
  return apiFetch(path)
}

export async function apiPost(path: string, payload: unknown) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function apiPut(path: string, payload: unknown) {
  return apiFetch(path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function apiDelete(path: string) {
  return apiFetch(path, { method: 'DELETE' })
}

export async function apiPatch(path: string, payload: unknown) {
  return apiFetch(path, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
