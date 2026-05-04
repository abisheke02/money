'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, Clock, ArrowRight, TrendingUp, TrendingDown, Wallet, Target, Search, Bell, X, Crown } from 'lucide-react'
import Link from 'next/link'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { useCurrency } from '@/lib/contexts/CurrencyContext'
import { usePlan, PLAN_LABELS } from '@/lib/contexts/PlanContext'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DashboardSummary, CategorySpend, DailyCashflow, Transaction } from '@/types'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/format'

export default function DashboardPage() {
  const { activeBusiness, loading: businessLoading } = useBusiness()
  const { plan, daysLeft } = usePlan()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([])
  const [dailyCashflow, setDailyCashflow] = useState<DailyCashflow[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [reminders, setReminders] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { currentCurrency, currencies, loading: currencyLoading } = useCurrency()

  const fetchData = useCallback(async () => {
    if (!activeBusiness) return
    setLoading(true)
    try {
      const bId = activeBusiness.id
      const [summaryRes, chartsRes, transactionsRes, remindersRes] = await Promise.all([
        fetch(`/api/dashboard?businessId=${bId}`),
        fetch(`/api/charts?businessId=${bId}`),
        fetch(`/api/transactions?limit=6&sortBy=date&sortOrder=desc&businessId=${bId}`),
        fetch(`/api/transactions?businessId=${bId}&limit=100`)
      ])
      const summaryData = await summaryRes.json()
      const chartsData = await chartsRes.json()
      const transactionsData = await transactionsRes.json()
      const remindersData = await remindersRes.json()
      setSummary(summaryData)
      setCategorySpend(chartsData.categorySpend || [])
      setDailyCashflow(chartsData.dailyCashflow || [])
      setRecentTransactions(transactionsData.transactions || [])
      const now = new Date()
      setReminders((remindersData.transactions || []).filter((tx: Transaction) => {
        if (!tx.due_date) return false
        const diff = Math.ceil((new Date(tx.due_date).getTime() - now.getTime()) / 86400000)
        return diff >= 0 && diff <= (tx.reminder_days || 3)
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeBusiness])

  useEffect(() => { fetchData() }, [fetchData])

  const fmt = useCallback((amount: number) => {
    const sym = currencies.find(c => c.code === currentCurrency)?.symbol ?? currentCurrency
    return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }, [currentCurrency, currencies])

  if (loading || businessLoading || currencyLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }
  if (!activeBusiness) {
    return <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
      <div className="p-4 rounded-full bg-white/5"><AlertCircle className="w-10 h-10" /></div>
      <p className="font-semibold">Select a business to continue</p>
    </div>
  }

  const monthCredit = summary?.monthCredit || 0
  const monthDebit  = summary?.monthDebit  || 0
  const totalBalance = summary?.totalBalance || 0
  const savingsRate  = monthCredit > 0 ? Math.round(((monthCredit - monthDebit) / monthCredit) * 100) : 0
  const totalCatSpend = categorySpend.reduce((s, c) => s + c.amount, 0)

  const summaryCards = [
    { title: 'Total Balance',   value: fmt(totalBalance), change: '+12.4%', sub: 'vs last month',  icon: Wallet, color: 'text-white', border: 'border-white/10', bg: 'from-white/10 to-white/5' },
    { title: 'Monthly Income',  value: fmt(monthCredit), change: '+8.1%', sub: 'this month', icon: TrendingUp,  color: 'text-emerald-400', border: 'border-white/10', bg: 'from-emerald-500/10 to-white/5' },
    { title: 'Monthly Expense', value: fmt(monthDebit), change: '-3.2%', sub: 'this month', icon: TrendingDown, color: 'text-rose-400', border: 'border-white/10', bg: 'from-rose-500/10 to-white/5' },
    { title: 'Savings Rate',    value: `${Math.max(0,savingsRate)}%`, change: '+4.5%', sub: 'of income', icon: Target,  color: 'text-cyan-400', border: 'border-white/10', bg: 'from-cyan-500/10 to-white/5' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Plan expiry banner */}
      {daysLeft !== null && daysLeft <= 7 && plan !== 'free' && (
        <div className={cn(
          "flex items-center justify-between gap-4 rounded-2xl px-5 py-3 text-sm font-semibold",
          daysLeft <= 0
            ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
            : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
        )}>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 flex-shrink-0" />
            {daysLeft <= 0
              ? `Your ${PLAN_LABELS[plan].name} plan has expired.`
              : `Your ${PLAN_LABELS[plan].name} plan expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
            }
          </div>
          <Link href="/dashboard/pricing" className="underline underline-offset-2 hover:opacity-80 whitespace-nowrap">
            Renew Now
          </Link>
        </div>
      )}

      {/* Header Panel */}
      <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between shadow-2xl">
        <div>
          <p className="text-sm text-emerald-400 font-bold tracking-widest uppercase">Welcome back</p>
          <h2 className="text-3xl font-extrabold text-white mt-1">{activeBusiness.name}</h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">Your financial command center is ready.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Quick search..."
              className="rounded-2xl border border-white/10 bg-slate-900/70 pl-11 pr-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-primary/50 w-full md:w-64 transition-all"
            />
          </div>
          <Button variant="outline" className="rounded-2xl">Export</Button>
          <Link href="/dashboard/transactions?action=add">
            <Button className="rounded-2xl px-6 gap-2"><PlusIcon className="w-4 h-4" /> Add Transaction</Button>
          </Link>
        </div>
      </header>

      {/* Summary Row */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.title} className={cn("rounded-[32px] border p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br", card.border, card.bg)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="mt-4 text-xl sm:text-2xl md:text-3xl font-black text-white font-mono tabular-nums">{card.value}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/5 shadow-inner">
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/10 border border-emerald-500/20 px-3 py-0.5 text-[10px] font-black text-emerald-400">
                {card.change}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {card.sub}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Analytics Section */}
      <section className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Cash Flow Chart */}
        <div className="xl:col-span-2 rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-2xl flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Cash Flow Overview</h3>
              <p className="text-sm text-slate-400 font-medium">Monthly performance and growth trend</p>
            </div>
            <select className="rounded-2xl border border-white/5 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            {dailyCashflow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCashflow} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 12 }}
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff' }}
                  />
                  <Bar dataKey="credit" name="Income" fill="url(#colorIncome)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="debit" name="Expense" fill="url(#colorExpense)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-medium">Insufficient data for chart</div>
            )}
          </div>
        </div>

        {/* Categories Split */}
        <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center">
          <div className="w-full mb-8">
            <h3 className="text-2xl font-black text-white tracking-tight text-center">Spending Split</h3>
            <p className="text-sm text-slate-400 font-medium text-center">Top expense categories</p>
          </div>

          <div className="relative flex items-center justify-center h-56 w-56 mb-8 mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={categorySpend} dataKey="amount" cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} stroke="none">
                    {categorySpend.map((e, index) => <Cell key={index} fill={e.categoryColor} className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] outline-none" />)}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Spent</p>
                <h4 className="text-2xl font-black text-white mt-1">{fmt(totalCatSpend)}</h4>
             </div>
          </div>

          <div className="w-full space-y-3">
            {categorySpend.slice(0, 4).map((cat) => (
              <div key={cat.categoryName} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-4 py-3 group transition-colors hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.categoryColor }} />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{cat.categoryName}</span>
                </div>
                <span className="text-sm font-black text-white font-mono">{totalCatSpend > 0 ? Math.round((cat.amount / totalCatSpend) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Recent Transactions</h3>
            <p className="text-sm text-slate-400 font-medium font-mono uppercase tracking-widest">Live Activity Log</p>
          </div>
          <Link href="/dashboard/transactions">
             <Button variant="ghost" className="rounded-2xl px-6 gap-2 text-emerald-400 hover:bg-emerald-400/10">
                View All <ArrowRight className="w-4 h-4" />
             </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">
                <th className="px-6 py-2">Entity</th>
                <th className="px-6 py-2">Timestamp</th>
                <th className="px-6 py-2">Category</th>
                <th className="px-6 py-2 text-right">Amount</th>
                <th className="px-6 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="rounded-2xl bg-slate-900/60 shadow-lg group hover:bg-slate-800 transition-all duration-300">
                  <td className="rounded-l-3xl px-6 py-5">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{tx.note || 'Internal Transfer'}</div>
                    {tx.tags && <div className="text-[10px] text-slate-500 mt-1">#{tx.tags}</div>}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-medium">
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                     <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#334155' }} />
                        <span className="text-sm font-bold text-slate-300">{tx.category?.name || 'Unsorted'}</span>
                     </span>
                  </td>
                  <td className={cn("px-6 py-5 text-right font-black font-mono text-base tabular-nums", tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400')}>
                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td className="rounded-r-3xl px-6 py-5 text-center">
                    <Badge variant={tx.type as any} className="font-black text-[10px] shadow-sm">
                      {tx.method || 'CASH'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr><td colSpan={5} className="text-center py-20 text-slate-500 font-medium">No activity recorded yet for this business.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  )
}
