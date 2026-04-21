'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Globe, AlertCircle, Clock } from 'lucide-react'
import { useCurrency } from '@/lib/contexts/CurrencyContext'

interface OverallStats {
  grandTotal: { income: number; expense: number; pending: number; netProfit: number }
  breakdown: { id: number; name: string; income: number; expense: number; pending: number; netProfit: number }[]
}

export default function OverallDashboard() {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentCurrency, currencies } = useCurrency()

  const fmt = (amount: number) => {
    const sym = currencies.find(c => c.code === currentCurrency)?.symbol ?? currentCurrency
    return `${sym}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  useEffect(() => {
    fetch('/api/overall').then(r => r.json()).then(setStats).catch(() => setError('Failed to load')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
  if (error || !stats) return <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs gap-2"><AlertCircle className="w-6 h-6 text-rose-400" /><p>{error}</p></div>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Overall Finances</h1>
          <p className="text-[10px] text-muted-foreground">Aggregated across all businesses</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/50 bg-secondary/50">
          <Globe className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-muted-foreground">All Businesses</span>
        </div>
      </div>

      {/* Grand Totals */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Income', value: fmt(stats.grandTotal.income), color: 'text-emerald-400', accent: 'border-emerald-500/20 bg-emerald-500/10', icon: ArrowUpRight },
          { label: 'Total Expense', value: fmt(stats.grandTotal.expense), color: 'text-rose-400', accent: 'border-rose-500/20 bg-rose-500/10', icon: ArrowDownRight },
          { label: 'Pending', value: (stats.grandTotal.pending < 0 ? '-' : '') + fmt(stats.grandTotal.pending), color: 'text-amber-400', accent: 'border-amber-500/20 bg-amber-500/10', icon: Clock },
          { label: 'Net Profit', value: (stats.grandTotal.netProfit >= 0 ? '+' : '') + fmt(stats.grandTotal.netProfit), color: stats.grandTotal.netProfit >= 0 ? 'text-cyan-400' : 'text-rose-400', accent: 'border-cyan-500/20 bg-cyan-500/10', icon: Globe },
        ].map(({ label, value, color, accent, icon: Icon }) => (
          <div key={label} className={`card ${accent} p-3 flex items-center gap-3`}>
            <div className={`w-8 h-8 rounded-xl bg-background/50 flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/80">{label}</p>
              <p className={`text-base font-bold font-mono ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
          <p className="text-sm font-semibold text-foreground">Business Breakdown</p>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border/50 bg-secondary/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Business</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Income</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Expense</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Pending</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {stats.breakdown.map(b => (
              <tr key={b.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-foreground ring-1 ring-border/50">{b.name.charAt(0).toUpperCase()}</div>
                    <span className="text-foreground font-medium">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">{fmt(b.income)}</td>
                <td className="px-4 py-3 text-right font-mono text-rose-400 font-semibold">{fmt(b.expense)}</td>
                <td className="px-4 py-3 text-right font-mono text-amber-400 font-semibold">{fmt(b.pending)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`flex items-center justify-end gap-1 font-mono font-bold ${b.netProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {b.netProfit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {fmt(b.netProfit)}
                  </span>
                </td>
              </tr>
            ))}
            {stats.breakdown.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No businesses found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
