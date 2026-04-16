import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles,
  Bell,
  LogOut,
  UserCog
} from 'lucide-react'
import { apiGet, apiPost, clearTokens } from '../lib/api'
import { showToast } from './ToastContainer'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/markets', label: 'Markets', icon: BarChart3 },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/risk', label: 'Risk', icon: ShieldCheck },
  { to: '/accounts', label: 'Accounts', icon: Users },
  { to: '/strategies', label: 'Strategies', icon: Sparkles },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export function Layout() {
  const [me, setMe] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [showUsers, setShowUsers] = useState(false)

  useEffect(() => {
    apiGet('/api/auth/me').then((res) => setMe(res.data)).catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await apiPost('/api/auth/logout', {})
    } catch {
      // ignore logout errors
    }
    clearTokens()
    window.dispatchEvent(new CustomEvent('admin:unauthorized'))
    showToast('Logged out', 'success')
  }

  const loadUsers = async () => {
    try {
      const res = await apiGet('/api/auth/users')
      setUsers(res.data || [])
      setShowUsers(true)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const updateUser = async (userId: string, patch: any) => {
    try {
      await apiPatch(`/api/auth/users/${userId}`, patch)
      showToast('User updated', 'success')
      loadUsers()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-lg font-bold tracking-tight">Quant Engine</div>
          <div className="text-xs text-slate-500">Admin Dashboard</div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400 truncate max-w-[120px]">
              {me?.email || me?.userId || 'User'}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadUsers}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
                title="Users"
              >
                <UserCog className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          {me?.role && (
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{me.role}</div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      {showUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Users</h3>
              <button
                onClick={() => setShowUsers(false)}
                className="px-3 py-1 rounded text-sm bg-slate-700 hover:bg-slate-600 text-white"
              >
                Close
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} className="border-b border-slate-800">
                    <td className="py-2 text-slate-100">{u.email}</td>
                    <td className="py-2">
                      <select
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                        value={u.role}
                        onChange={(e) => updateUser(u.userId, { role: e.target.value })}
                      >
                        <option value="owner">owner</option>
                        <option value="operator">operator</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                        value={u.status}
                        onChange={(e) => updateUser(u.userId, { status: e.target.value })}
                      >
                        <option value="active">active</option>
                        <option value="disabled">disabled</option>
                      </select>
                    </td>
                    <td className="py-2 text-xs text-slate-400">
                      {u.userId === me?.userId ? 'You' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

async function apiPatch(path: string, payload: unknown) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '')
  const bearer = sessionStorage.getItem('bearerToken') || ''
  const control = sessionStorage.getItem('controlToken') || ''
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (bearer) headers['authorization'] = `Bearer ${bearer}`
  if (control) headers['x-control-token'] = control
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(payload) })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}
