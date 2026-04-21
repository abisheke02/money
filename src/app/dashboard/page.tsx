'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, Clock, ArrowRight, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import Link from 'next/link'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { useCurrency } from '@/lib/contexts/CurrencyContext'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DashboardSummary, CategorySpend, DailyCashflow, Transaction } from '@/types'

const quickActions = [
  { label: '+ Income',   href: '/dashboard/transactions?action=add&type=credit', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: '+ Expense',  href: '/dashboard/transactions?action=add&type=debit',  color: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20' },
  { label: 'Scan Bill',  href: '/dashboard/transactions?action=scan',             color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Charts',     href: '/dashboard/overall',                              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { label: 'Categories', href: '/dashboard/categories',                           color: 'text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20' },
]

export default function DashboardPage() {
  const { activeBusiness, loading: businessLoading } = useBusiness()
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
        fetch(`/api/transactions?limit=8&sortBy=date&sortOrder=desc&businessId=${bId}`),
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
    return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
  }
  if (!activeBusiness) {
    return <div className="flex flex-col items-center justify-center h-48 text-slate-400"><AlertCircle className="w-8 h-8 mb-2" /><p>Select a business to continue</p></div>
  }

  const monthCredit = summary?.monthCredit || 0
  const monthDebit  = summary?.monthDebit  || 0
  const totalBalance = summary?.totalBalance || 0
  const savingsRate  = monthCredit > 0 ? Math.round(((monthCredit - monthDebit) / monthCredit) * 100) : 0
  const totalCatSpend = categorySpend.reduce((s, c) => s + c.amount, 0)

  const summaryCards = [
    { title: 'Total Balance',   value: fmt(totalBalance),         sub: 'all time',  icon: Wallet,      color: 'text-white',                          border: 'border-emerald-500/40', bg: 'from-emerald-500/10 to-cyan-500/5' },
    { title: 'Pending',         value: (summary?.totalPending || 0) < 0 ? `-${fmt(Math.abs(summary?.totalPending || 0))}` : fmt(summary?.totalPending || 0), sub: 'future', icon: Clock, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'from-amber-500/10 to-transparent' },
    { title: 'Monthly Income',  value: fmt(monthCredit),          sub: 'this month', icon: TrendingUp,  color: 'text-emerald-400',                    border: 'border-emerald-500/40', bg: 'from-emerald-500/10 to-transparent' },
    { title: 'Monthly Expense', value: fmt(monthDebit),           sub: 'this month', icon: TrendingDown, color: 'text-rose-400',                      border: 'border-rose-500/40',    bg: 'from-rose-500/10 to-transparent' },
    { title: 'Savings Rate',    value: `${Math.max(0,savingsRate)}%`, sub: 'of income', icon: Target,  color: savingsRate >= 0 ? 'text-cyan-400' : 'text-rose-400', border: 'border-cyan-500/40', bg: 'from-cyan-500/10 to-transparent' },
  ]

  const colHd = 'px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-white/10 last:border-r-0'
  const colTd = 'px-3 py-1.5 border-r border-white/10 last:border-r-0'

  return (
    <div className="space-y-3">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-500 font-medium">Welcome back</p>
          <h2 className="text-lg font-bold leading-tight text-white">{activeBusiness.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map(({ label, href, color }) => (
            <Link key={label} href={href} className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${color}`}>{label}</Link>
          ))}
          <Link href="/dashboard/transactions" className="text-xs px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 transition flex items-center gap-1">
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Reminders strip */}
      {reminders.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300 font-medium">Reminders:</span>
          <div className="flex gap-3 flex-wrap">
            {reminders.map(tx => (
              <span key={tx.id} className="text-xs text-amber-200">
                {tx.category?.name} — {fmt(tx.amount)} due {new Date(tx.due_date!).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map(({ title, value, sub, icon: Icon, color, border, bg }) => (
          <div key={title} className={`rounded-2xl border-2 ${border} bg-gradient-to-br ${bg} p-3 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium truncate">{title}</p>
              <p className={`text-base font-bold leading-tight font-mono ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-3">

        {/* Cash Flow Chart */}
        <div className="col-span-5 rounded-2xl border-2 border-white/10 bg-white/5 overflow-hidden">
          <div className="px-3 pt-3 pb-1 border-b border-white/10">
            <p className="text-xs font-bold text-white">Cash Flow</p>
            <p className="text-[10px] text-slate-400">Last 7 days</p>
          </div>
          <div className="p-3">
            {dailyCashflow.length > 0 ? (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyCashflow} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} style={{ background: 'transparent' }}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '11px' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '2px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Bar dataKey="credit" name="Income"  fill="#10B981" radius={[3,3,0,0]} />
                    <Bar dataKey="debit"  name="Expense" fill="#F43F5E" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-slate-500 text-xs">No data yet</div>
            )}
          </div>
        </div>

        {/* Spending Split */}
        <div className="col-span-3 rounded-2xl border-2 border-white/10 bg-white/5 overflow-hidden">
          <div className="px-3 pt-3 pb-1 border-b border-white/10">
            <p className="text-xs font-bold text-white">Spending Split</p>
            <p className="text-[10px] text-slate-400">By category</p>
          </div>
          <div className="p-3">
            {categorySpend.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="h-28 w-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorySpend} dataKey="amount" cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2}>
                        {categorySpend.map((e, i) => <Cell key={i} fill={e.categoryColor} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#94a3b8' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(v: number) => [fmt(v), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  {categorySpend.slice(0, 4).map(cat => (
                    <div key={cat.categoryName} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: cat.categoryColor }} />
                      <span className="text-[10px] text-slate-300 truncate flex-1">{cat.categoryName}</span>
                      <span className="text-[10px] text-white font-bold">{totalCatSpend > 0 ? Math.round((cat.amount / totalCatSpend) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-slate-500 text-xs">No data yet</div>
            )}
          </div>
        </div>

        {/* Period Summary + Top Categories */}
        <div className="col-span-4 rounded-2xl border-2 border-white/10 bg-white/5 overflow-hidden">
          <div className="px-3 pt-3 pb-1 border-b border-white/10">
            <p className="text-xs font-bold text-white">Period Summary</p>
          </div>
          <div className="p-3">
            <table className="w-full text-xs border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-slate-400 border-r border-white/10">Period</th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-emerald-400 border-r border-white/10">Income</th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-rose-400">Expense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Today', inc: summary?.todayCredit || 0, exp: summary?.todayDebit || 0 },
                  { label: 'This Week', inc: summary?.weekCredit || 0, exp: summary?.weekDebit || 0 },
                  { label: 'This Month', inc: monthCredit, exp: monthDebit },
                ].map(({ label, inc, exp }) => (
                  <tr key={label} className="hover:bg-white/5 transition">
                    <td className="px-3 py-1.5 text-slate-400 border-r border-white/10">{label}</td>
                    <td className="px-3 py-1.5 text-right font-semibold font-mono text-emerald-400 border-r border-white/10">+{fmt(inc)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold font-mono text-rose-400">-{fmt(exp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs font-bold text-white mt-3 mb-2">Top Categories</p>
            <div className="space-y-2">
              {categorySpend.slice(0, 3).map(cat => {
                const pct = totalCatSpend > 0 ? Math.round((cat.amount / totalCatSpend) * 100) : 0
                return (
                  <div key={cat.categoryName}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-300 font-medium">{cat.categoryName}</span>
                      <span className="text-slate-400 font-bold">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 border border-white/8">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.categoryColor }} />
                    </div>
                  </div>
                )
              })}
              {categorySpend.length === 0 && <p className="text-[10px] text-slate-500">No data yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border-2 border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
          <div>
            <p className="text-xs font-bold text-white">Recent Transactions</p>
            <p className="text-[10px] text-slate-400">Latest activity</p>
          </div>
          <Link href="/dashboard/transactions" className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className={colHd + ' w-[30%]'}>Description</th>
                <th className={colHd}>Date</th>
                <th className={colHd}>Category</th>
                <th className={colHd}>Method</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className={colTd + ' w-[30%] text-white font-medium'}>
                    <span className="block truncate">{tx.note || tx.category?.name || 'Transaction'}</span>
                  </td>
                  <td className={colTd + ' text-slate-400 whitespace-nowrap'}>
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className={colTd}>
                    <span className="flex items-center gap-1.5">
                      {tx.category?.color && <span className="w-2 h-2 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: tx.category.color }} />}
                      <span className="text-slate-300 truncate">{tx.category?.name || '—'}</span>
                    </span>
                  </td>
                  <td className={colTd}>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                      {tx.method || 'Cash'}
                    </span>
                  </td>
                  <td className={`px-3 py-1.5 text-right font-bold font-mono whitespace-nowrap ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No transactions yet.{' '}
            <Link href="/dashboard/transactions?action=add" className="text-emerald-400 hover:text-emerald-300 font-medium">Add one</Link>
          </div>
        )}
      </div>
    </div>
  )
}
