import { useEffect, useState } from 'react'
import { apiPost, setBearerToken, setControlToken, hasToken, clearTokens } from '../lib/api'
import { showToast } from './ToastContainer'

type Mode = 'login' | 'register' | 'token'

export function TokenGate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(!hasToken())
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setTokenValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handler = () => {
      clearTokens()
      setOpen(true)
    }
    window.addEventListener('admin:unauthorized', handler)
    return () => window.removeEventListener('admin:unauthorized', handler)
  }, [])

  if (!open) return <>{children}</>

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiPost('/api/auth/login', { email, password })
      setBearerToken(res.data.token || res.data.accessToken || res.data.bearerToken || '')
      setOpen(false)
      showToast('Logged in', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost('/api/auth/register', { email, password })
      showToast('Registered. Please log in.', 'success')
      setMode('login')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToken = () => {
    if (token.trim()) {
      setControlToken(token.trim())
      setOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">
          {mode === 'login' && 'Sign In'}
          {mode === 'register' && 'Register'}
          {mode === 'token' && 'Control Token'}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {mode === 'login' && 'Enter your credentials to access the admin panel.'}
          {mode === 'register' && 'Create a new account.'}
          {mode === 'token' && 'Enter your x-control-token for legacy access.'}
        </p>

        {mode === 'token' ? (
          <>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 mb-4"
              placeholder="Control token"
              value={token}
              onChange={(e) => setTokenValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleToken()
              }}
            />
            <button
              className="w-full px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white mb-3"
              onClick={handleToken}
            >
              Continue
            </button>
          </>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 mb-4"
              placeholder="Password (min 12)"
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 mb-3"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          {mode !== 'login' && (
            <button className="hover:text-slate-200" onClick={() => setMode('login')}>
              Sign In
            </button>
          )}
          {mode !== 'register' && (
            <button className="hover:text-slate-200" onClick={() => setMode('register')}>
              Register
            </button>
          )}
          {mode !== 'token' && (
            <button className="hover:text-slate-200" onClick={() => setMode('token')}>
              Use Token
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
