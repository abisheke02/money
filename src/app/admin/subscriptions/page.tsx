'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'

interface SubRow {
  id: number
  user_id: number
  username: string
  email: string
  plan: string
  status: string
  started_at: string
  expires_at: string | null
  amount_paid: number
  payment_method: string | null
  notes: string | null
  created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  premium: 'bg-amber-500/20 text-amber-400',
  pro:     'bg-cyan-500/20 text-cyan-400',
  free:    'bg-slate-700 text-slate-400',
}
const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-500/20 text-emerald-400',
  trial:     'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-rose-500/20 text-rose-400',
  expired:   'bg-slate-700 text-slate-500',
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('moneyflow_admin_auth') ?? '{}').token ?? '' } catch { return '' }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const token = getToken()
    const params = new URLSearchParams({
      page: String(page),
      ...(planFilter   ? { plan: planFilter }     : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    })
    const res = await fetch(`/api/admin/subscriptions?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setSubs(data.subscriptions ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, planFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / 20)
  const totalRevenue = subs.reduce((s, r) => s + r.amount_paid, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-1">
          {total} subscription record{total !== 1 ? 's' : ''}
          {subs.length > 0 && ` — ₹${totalRevenue.toLocaleString('en-IN')} shown`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-500" />
        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
        {(planFilter || statusFilter) && (
          <button
            onClick={() => { setPlanFilter(''); setStatusFilter(''); setPage(1) }}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Started</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Expires</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Amount</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Method</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">Loading…</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No subscriptions found</td></tr>
              ) : subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{s.username}</p>
                    <p className="text-slate-500">{s.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${PLAN_COLORS[s.plan] ?? 'bg-slate-700 text-slate-400'}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[s.status] ?? 'bg-slate-700 text-slate-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(s.started_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-slate-400">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-emerald-400 font-medium">
                    {s.amount_paid > 0 ? `₹${s.amount_paid.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{s.payment_method ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[150px] truncate">{s.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
