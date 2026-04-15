import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/markets', label: 'Markets', icon: BarChart3 },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/risk', label: 'Risk', icon: ShieldCheck },
  { to: '/accounts', label: 'Accounts', icon: Users },
  { to: '/strategies', label: 'Strategies', icon: Sparkles },
]

export function Layout() {
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
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
