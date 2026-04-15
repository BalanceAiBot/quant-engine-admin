import { useEffect, useState } from 'react'
import { setToken, hasToken, clearToken } from '../lib/api'

export function TokenGate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(!hasToken())
  const [value, setValue] = useState('')

  useEffect(() => {
    const handler = () => {
      clearToken()
      setOpen(true)
    }
    window.addEventListener('admin:unauthorized', handler)
    return () => window.removeEventListener('admin:unauthorized', handler)
  }, [])

  if (!open) return <>{children}</>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Control Token Required</h2>
        <p className="text-sm text-slate-400 mb-4">Enter your x-control-token to access the admin panel.</p>
        <input
          type="password"
          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 mb-4"
          placeholder="Control token"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              setToken(value.trim())
              setOpen(false)
            }
          }}
        />
        <button
          className="w-full px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={() => {
            if (value.trim()) {
              setToken(value.trim())
              setOpen(false)
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
