'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Edit2, X, Check } from 'lucide-react'

interface UserRow {
  id: number
  username: string
  email: string
  created_at: string
  plan: string | null
  sub_status: string | null
  sub_expires: string | null
  amount_paid: number | null
}

interface EditState {
  userId: number
  plan: string
  status: string
  expires_at: string
  amount_paid: string
  notes: string
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'premium') return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">PREMIUM</span>
  if (plan === 'pro')     return <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">PRO</span>
  return <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold">FREE</span>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('moneyflow_admin_auth') ?? '{}').token ?? '' } catch { return '' }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const token = getToken()
    const params = new URLSearchParams({ page: String(page), ...(search ? { search } : {}) })
    const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  const startEdit = (u: UserRow) => {
    setEditing({
      userId: u.id,
      plan: u.plan ?? 'free',
      status: u.sub_status ?? 'active',
      expires_at: u.sub_expires ? u.sub_expires.slice(0, 10) : '',
      amount_paid: String(u.amount_paid ?? 0),
      notes: '',
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    const token = getToken()
    await fetch(`/api/admin/users/${editing.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        plan: editing.plan,
        status: editing.status,
        expires_at: editing.expires_at || null,
        amount_paid: parseFloat(editing.amount_paid) || 0,
        notes: editing.notes || null,
      }),
    })
    setEditing(null)
    setSaving(false)
    load()
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-slate-400 mt-1">{total} registered user{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by username or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-900 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400 transition"
        />
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Edit Subscription</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Plan</label>
                  <select
                    value={editing.plan}
                    onChange={e => setEditing({ ...editing, plan: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro — ₹199/mo</option>
                    <option value="premium">Premium — ₹499/mo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select
                    value={editing.status}
                    onChange={e => setEditing({ ...editing, status: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={editing.expires_at}
                    onChange={e => setEditing({ ...editing, expires_at: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={editing.amount_paid}
                    onChange={e => setEditing({ ...editing, amount_paid: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea
                  value={editing.notes}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-400 resize-none"
                  placeholder="Internal notes…"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Username</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Sub Status</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Expires</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Amount Paid</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{u.username}</td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-5 py-3">
                    {u.sub_status ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.sub_status === 'active'    ? 'bg-emerald-500/20 text-emerald-400' :
                        u.sub_status === 'trial'     ? 'bg-blue-500/20 text-blue-400' :
                        u.sub_status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' :
                                                       'bg-slate-700 text-slate-400'
                      }`}>{u.sub_status}</span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {u.sub_expires ? new Date(u.sub_expires).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-300">
                    {u.amount_paid ? `₹${u.amount_paid.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => startEdit(u)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
