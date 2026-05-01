'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, Lightbulb, LogOut, Shield, Menu, X, ArrowLeft, Plus
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/format'

const navItems = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users',         icon: Users,           label: 'Users' },
  { href: '/admin/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { href: '/admin/features',      icon: Lightbulb,       label: 'Feature Tracker' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [adminName, setAdminName] = useState('Admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return }
    const raw = localStorage.getItem('moneyflow_admin_auth')
    if (!raw) { router.push('/admin/login'); return }
    try {
      const { username } = JSON.parse(raw)
      setAdminName(username ?? 'Admin')
      setAuthed(true)
    } catch {
      router.push('/admin/login')
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('moneyflow_admin_auth')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>
  if (!authed) return <div className="h-screen bg-background" />

  return (
    <div className="h-screen overflow-hidden bg-background flex text-foreground">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn("fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen flex flex-col border-r border-white/5 bg-background backdrop-blur-xl transform transition-all duration-300 ease-in-out", sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0')}>
        {/* Logo */}
        <div className="flex-shrink-0 px-6 py-6 flex items-center justify-between border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 transition hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 ring-4 ring-violet-500/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black leading-tight tracking-tight">Admin OS</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">MoneyFlow v2</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Management</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn("flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-xs font-black transition-all group", 
                      isActive 
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white shadow-xl border border-violet-500/20' 
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-violet-400 shadow-sm" : "text-slate-600")} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
        </div>

        {/* User context + logout */}
        <div className="flex-shrink-0 px-4 py-6 border-t border-white/5 space-y-4">
          <div className="px-4 py-4 rounded-[24px] bg-slate-900 shadow-inner border border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center font-black text-[10px] text-violet-400 border border-violet-500/20">{adminName[0].toUpperCase()}</div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Active Admin</p>
                   <p className="text-sm font-black text-white">{adminName}</p>
                </div>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-background/80 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-3">
                 <Link href="/dashboard" className="p-2.5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/10">
                    <ArrowLeft className="w-4 h-4" />
                 </Link>
                 <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Direct to app</p>
                    <p className="text-sm font-black text-white">Return Home</p>
                 </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-white/5 text-[10px] uppercase font-black px-4"><Plus className="w-3 h-3 mr-1" /> New Entry</Button>
                <div className="w-[2px] h-8 bg-white/5 mx-2" />
             </div>
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:block">Internal Access Only</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
