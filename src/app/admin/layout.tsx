'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, Lightbulb, LogOut, Shield, Menu, X,
} from 'lucide-react'

const navItems = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users',         icon: Users,           label: 'Users' },
  { href: '/admin/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { href: '/admin/features',      icon: Lightbulb,       label: 'Feature Tracker' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [adminName, setAdminName] = useState('Admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const raw = localStorage.getItem('moneyflow_admin_auth')
    if (!raw) { router.push('/admin/login'); return }
    try {
      const { username } = JSON.parse(raw)
      setAdminName(username ?? 'Admin')
    } catch {
      router.push('/admin/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('moneyflow_admin_auth')
    router.push('/admin/login')
  }

  if (!mounted) return null
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="h-screen overflow-hidden bg-slate-950 flex text-white">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 h-screen flex flex-col border-r border-white/10 bg-slate-900 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex-shrink-0 px-4 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Admin Panel</p>
              <p className="text-[10px] text-slate-400">MoneyFlow</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/25 to-purple-500/25 text-white shadow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="flex-shrink-0 px-2 py-3 border-t border-white/10 space-y-1">
          <div className="px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">Logged in as</p>
            <p className="text-xs font-bold text-white">{adminName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-slate-200">
              {navItems.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Admin'}
            </h2>
          </div>
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← Back to App
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
