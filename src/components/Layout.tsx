import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles,
  Bell,
  LogOut,
  UserCog,
  Menu,
  X,
} from 'lucide-react'
import { apiGet, apiPost, clearTokens } from '../lib/api'
import { showToast } from './ToastContainer'
import { Drawer } from './ui/Drawer'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { DataTable } from './composite/DataTable'
import { LiveIndicator } from './ui/LiveIndicator'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/markets', label: 'Markets', icon: BarChart3 },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/risk', label: 'Risk', icon: ShieldCheck },
  { to: '/accounts', label: 'Accounts', icon: Users },
  { to: '/strategies', label: 'Strategies', icon: Sparkles },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

function useBreadcrumb() {
  const location = useLocation()
  const path = location.pathname.replace('/', '')
  const item = navItems.find((n) => n.to.replace('/', '') === path)
  return item?.label || 'Dashboard'
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [userDrawerOpen, setUserDrawerOpen] = useState(false)
  const breadcrumb = useBreadcrumb()

  useEffect(() => {
    apiGet('/api/auth/me')
      .then((res) => setMe(res.data))
      .catch(() => {})
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
      setUserDrawerOpen(true)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const updateUser = async (userId: string, patch: any) => {
    try {
      await apiPatch(`/api/auth/users/${userId}`, patch)
      showToast('User updated', 'success')
      const res = await apiGet('/api/auth/users')
      setUsers(res.data || [])
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="flex h-screen bg-surface-base">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-surface-border bg-surface-elevated transition-all duration-300',
          sidebarOpen ? 'w-56' : 'w-16'
        )}
      >
        <div
          className={cn(
            'flex h-14 items-center gap-3 border-b border-surface-border px-3',
            !sidebarOpen && 'justify-center px-2'
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            Q
          </div>
          {sidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-slate-100">Quant Engine</span>
              <span className="text-[10px] text-slate-500">Admin</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                  !sidebarOpen && 'justify-center px-2'
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-surface-border p-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface-elevated/50 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">Page /</span>{' '}
              <span className="font-medium text-slate-200">{breadcrumb}</span>
            </div>
            <LiveIndicator active={true} />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
              <span className="truncate max-w-[160px]">{me?.email || 'User'}</span>
              {me?.role && <Badge variant="default" size="sm">{me.role}</Badge>}
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={loadUsers}
              title="Users"
              className="px-2"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleLogout}
              title="Logout"
              className="px-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* User Drawer */}
      <Drawer
        open={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title="Users"
        description="Manage user roles and status"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setUserDrawerOpen(false)}>Close</Button>
          </div>
        }
      >
        <DataTable
          columns={[
            { key: 'email', header: 'Email' },
            {
              key: 'role',
              header: 'Role',
              render: (u: any) => (
                <select
                  className="rounded-md border border-surface-border bg-slate-950 px-2 py-1 text-xs text-slate-100"
                  value={u.role}
                  onChange={(e) => updateUser(u.userId, { role: e.target.value })}
                >
                  <option value="owner">owner</option>
                  <option value="operator">operator</option>
                </select>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (u: any) => (
                <select
                  className="rounded-md border border-surface-border bg-slate-950 px-2 py-1 text-xs text-slate-100"
                  value={u.status}
                  onChange={(e) => updateUser(u.userId, { status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              ),
            },
          ]}
          rows={users}
          density="compact"
          emptyTitle="No users"
        />
      </Drawer>
    </div>
  )
}

async function apiPatch(path: string, payload: unknown) {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '')
  const bearer = sessionStorage.getItem('bearerToken') || ''
  const control = sessionStorage.getItem('controlToken') || ''
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (bearer) headers['authorization'] = `Bearer ${bearer}`
  if (control) headers['x-control-token'] = control
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}
