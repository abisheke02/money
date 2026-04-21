'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Receipt, Tags, Settings, LogOut, Menu, X,
  Bell, Globe, Calculator, ClipboardList, Sparkles, Lock, CreditCard,
} from 'lucide-react'
import { BusinessProvider } from '@/lib/contexts/BusinessContext'
import { CurrencyProvider } from '@/lib/contexts/CurrencyContext'
import { PlanProvider, usePlan, PLAN_LABELS } from '@/lib/contexts/PlanContext'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { BusinessSwitcher } from '@/app/components/BusinessSwitcher'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

const navItems = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard',    gate: null },
  { href: '/dashboard/transactions',  icon: Receipt,         label: 'Transactions', gate: null },
  { href: '/dashboard/categories',    icon: Tags,            label: 'Categories',   gate: null },
  { href: '/dashboard/overall',       icon: Globe,           label: 'Overall',      gate: 'overall' },
  { href: '/dashboard/receivables',   icon: ClipboardList,   label: 'Receivables',  gate: 'receivables' },
  { href: '/dashboard/ai',            icon: Sparkles,        label: 'AI Advisor',   gate: 'aiAdvisor' },
  { href: '/dashboard/calculator',    icon: Calculator,      label: 'Calculator',   gate: null },
  { href: '/dashboard/settings',      icon: Settings,        label: 'Settings',     gate: null },
  { href: '/dashboard/pricing',       icon: CreditCard,      label: 'Plans',        gate: null },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const { plan, features } = usePlan()
  const label = PLAN_LABELS[plan]

  return (
    <>
      {/* Navigation */}
      <nav className="px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isLocked = item.gate && !features[item.gate as keyof typeof features]
          return (
            <Link
              key={item.href}
              href={isLocked ? '/dashboard/pricing' : item.href}
              onClick={onClose}
              className={`flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-white shadow'
                  : isLocked
                  ? 'text-slate-600 hover:text-slate-400'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={isLocked ? 'line-through decoration-slate-600' : ''}>{item.label}</span>
              {isLocked && <Lock className="w-2.5 h-2.5 ml-auto text-slate-600" />}
            </Link>
          )
        })}
      </nav>

      {/* Plan badge */}
      <div className="mt-auto px-2 pt-4 pb-1">
        <Link href="/dashboard/pricing" className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition hover:opacity-90 ${
          plan === 'premium' ? 'border-amber-500/30 bg-amber-500/10' :
          plan === 'pro'     ? 'border-cyan-500/30 bg-cyan-500/10' :
                               'border-white/10 bg-white/5'
        }`}>
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${label.badge}`}>
            {plan === 'premium' ? '★' : plan === 'pro' ? '◆' : '○'}
          </div>
          <div>
            <p className={`text-[10px] font-bold ${label.color}`}>{label.name} Plan</p>
            <p className="text-[9px] text-slate-500">{plan === 'free' ? 'Tap to upgrade' : label.price}</p>
          </div>
          {plan === 'free' && <span className="ml-auto text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">↑ PRO</span>}
        </Link>
      </div>
    </>
  )
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!localStorage.getItem('moneyflow_auth')) router.push('/')

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

      if (e.key.toLowerCase() === 'a') {
        e.preventDefault()
        router.push('/dashboard/transactions?action=add')
      }
      if (e.key === '/') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input')
        if (searchInput) {
          searchInput.focus()
        } else {
          router.push('/dashboard/transactions')
          // Small delay to allow navigation and mounting
          setTimeout(() => document.getElementById('search-input')?.focus(), 100)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const handleLogout = () => { localStorage.removeItem('moneyflow_auth'); router.push('/') }

  if (!mounted) return null

  return (
    <div className="h-screen overflow-hidden bg-background flex text-foreground">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <CurrencyProvider>
        <BusinessProvider>
          {/* Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-52 h-screen flex flex-col border-r border-white/10 bg-background backdrop-blur-xl transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>

            {/* Logo */}
            <div className="flex-shrink-0 px-3 py-3 flex items-center justify-between border-b border-white/5">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform flex-shrink-0">₹</div>
                <div>
                  <h1 className="text-sm font-bold leading-tight">Money Flow</h1>
                  <p className="text-[10px] text-slate-400 leading-tight">Finance Dashboard</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {/* Scrollable middle */}
            <div className="flex-1 flex flex-col overflow-y-auto sidebar-scroll py-2">
              <div className="px-2 pb-2">
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-1">
                  <BusinessSwitcher />
                </div>
              </div>
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Logout */}
            <div className="flex-shrink-0 px-2 py-2 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full">
                <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-16 bg-background/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"><Menu className="w-5 h-5" /></button>
                <div className="hidden lg:flex flex-col">
                  <p className="text-xs text-emerald-400 font-medium">Welcome back</p>
                  <p className="text-sm font-bold text-white">Your Financial Command Center</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                </button>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/20">
                  <div className="h-full w-full rounded-[9px] bg-slate-900 flex items-center justify-center font-bold text-xs text-white">AD</div>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="animate-fadeIn max-w-7xl mx-auto">
                <ErrorBoundary>{children}</ErrorBoundary>
              </div>
            </main>
          </div>
        </BusinessProvider>
      </CurrencyProvider>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <LayoutInner>{children}</LayoutInner>
    </PlanProvider>
  )
}
