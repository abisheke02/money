'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Check, AlertCircle, Edit2, Trash2, CheckCircle2, Hourglass } from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { useCurrency } from '@/lib/contexts/CurrencyContext'

interface Receivable {
  id: number; type: 'credit' | 'debit'; amount: number; note: string | null
  client_name: string | null; date: string; due_date: string | null; status: string; method: string | null
  category?: { name: string; color: string }
}

const statusCfg: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-400/10 text-amber-300' },
  received:  { label: 'Received',  cls: 'bg-emerald-400/10 text-emerald-300' },
  completed: { label: 'Completed', cls: 'bg-blue-400/10 text-blue-300' },
  overdue:   { label: 'Overdue',   cls: 'bg-rose-400/10 text-rose-300' },
}

export default function ReceivablesPage() {
  const { activeBusiness } = useBusiness()
  const { currentCurrency, currencies } = useCurrency()
  const [records, setRecords] = useState<Receivable[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'received' | 'overdue'>('all')

  const [form, setForm] = useState({ type: 'credit' as 'credit' | 'debit', client_name: '', amount: '', category_id: '', date: new Date().toISOString().split('T')[0], due_date: '', note: '', method: 'bank', status: 'pending' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])
  const fmt = useCallback((n: number) => `${currencies.find(c => c.code === currentCurrency)?.symbol ?? ''}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, [currencies, currentCurrency])
  const resetForm = () => setForm({ type: 'credit', client_name: '', amount: '', category_id: '', date: new Date().toISOString().split('T')[0], due_date: '', note: '', method: 'bank', status: 'pending' })

  const fetchData = useCallback(async () => {
    if (!activeBusiness) return
    setLoading(true)
    try {
      const [txRes, catRes] = await Promise.all([fetch(`/api/transactions?businessId=${activeBusiness.id}&limit=200`), fetch('/api/categories')])
      const txData = await txRes.json(); const catData = await catRes.json()
      setCategories(catData || [])
      const now = new Date()
      setRecords((txData.transactions || []).filter((t: any) => t.client_name || t.status === 'pending' || t.status === 'received').map((t: any) => ({
        ...t, status: t.due_date && t.status === 'pending' && new Date(t.due_date) < now ? 'overdue' : (t.status || 'pending')
      })))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [activeBusiness])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions'
    await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount), category_id: parseInt(form.category_id), business_id: activeBusiness?.id, currency: currentCurrency }) })
    setShowModal(false); setEditingId(null); resetForm(); fetchData()
  }

  const markReceived = async (id: number) => {
    const rec = records.find(r => r.id === id)
    if (!rec) return
    await fetch(`/api/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: rec.type, amount: rec.amount, category_id: (rec as any).category_id || 1, business_id: activeBusiness?.id, date: rec.date, status: 'received', client_name: rec.client_name, note: rec.note, method: rec.method, due_date: rec.due_date }) })
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' }); fetchData()
  }

  const openEdit = (r: Receivable) => {
    setForm({ type: r.type, client_name: r.client_name || '', amount: r.amount.toString(), category_id: '', date: r.date, due_date: r.due_date || '', note: r.note || '', method: r.method || 'bank', status: r.status })
    setEditingId(r.id); setShowModal(true)
  }

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter)
  const totalPending  = records.filter(r => r.status === 'pending' || r.status === 'overdue').reduce((s, r) => s + r.amount, 0)
  const totalReceived = records.filter(r => r.status === 'received').reduce((s, r) => s + r.amount, 0)
  const totalOverdue  = records.filter(r => r.status === 'overdue').reduce((s, r) => s + r.amount, 0)
  const creditCats    = categories.filter(c => c.type === 'credit' || c.type === 'both')

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">Receivables & Payables</h1>
          <p className="text-[10px] text-slate-400">Track pending client payments</p>
        </div>
        <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition">
          <Plus className="w-3 h-3" /> Add Entry
        </button>
      </div>

      {/* Summary + Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Pending', value: totalPending, icon: Hourglass, cls: 'text-amber-300 border-amber-500/20 bg-amber-500/5' },
          { label: 'Received', value: totalReceived, icon: CheckCircle2, cls: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Overdue', value: totalOverdue, icon: AlertCircle, cls: 'text-rose-300 border-rose-500/20 bg-rose-500/5' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cls}`}>
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="text-[10px] text-slate-400">{label}:</span>
            <span className="text-xs font-bold font-mono">{fmt(value)}</span>
          </div>
        ))}
        <div className="flex gap-1 ml-auto flex-wrap">
          {(['all', 'pending', 'received', 'overdue'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'}`}>
              {f}{f !== 'all' && <span className="ml-1 opacity-50">({records.filter(r => r.status === f).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-slate-500 text-xs gap-1">
            <p>No entries. <button onClick={() => setShowModal(true)} className="text-emerald-400">Add one</button></p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="border-b border-white/10 bg-slate-800/30">
              <tr>
                {['Client', 'Service / Note', 'Date', 'Due Date', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(r => {
                const cfg = statusCfg[r.status] || statusCfg.pending
                const daysLeft = r.due_date ? Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 86400000) : null
                return (
                  <tr key={r.id} className="hover:bg-white/5 transition">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-300 flex-shrink-0">{(r.client_name || '?')[0].toUpperCase()}</div>
                        <span className="text-white font-medium truncate max-w-[80px]">{r.client_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300 truncate max-w-[120px]">{r.note || '—'}</td>
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.due_date ? (
                        <span className={daysLeft !== null && daysLeft < 0 ? 'text-rose-300' : daysLeft !== null && daysLeft <= 7 ? 'text-amber-300' : 'text-slate-400'}>
                          {new Date(r.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          {daysLeft !== null && r.status === 'pending' && <span className="ml-1 opacity-60">({daysLeft < 0 ? `${Math.abs(daysLeft)}d over` : `${daysLeft}d`})</span>}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={`px-3 py-2 font-semibold font-mono whitespace-nowrap ${r.type === 'credit' ? 'text-emerald-300' : 'text-rose-300'}`}>{r.type === 'credit' ? '+' : '-'}{fmt(r.amount)}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.cls}`}>{cfg.label}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {(r.status === 'pending' || r.status === 'overdue') && (
                          <button onClick={() => markReceived(r.id)} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition" title="Mark received"><Check className="w-3 h-3" /></button>
                        )}
                        <button onClick={() => openEdit(r)} className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && isMounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">{editingId ? 'Edit Entry' : 'New Service Entry'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="flex gap-2">
                {(['credit', 'debit'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition border ${form.type === t ? (t === 'credit' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30') : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                    {t === 'credit' ? '+ To Receive' : '− To Pay'}
                  </button>
                ))}
              </div>
              <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Client / Business *</label><input required value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. Rajesh Kumar" className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Amount *</label><input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none font-mono" /></div>
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Category *</label><select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none"><option value="">Select</option>{creditCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Date *</label><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none" /></div>
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none" /></div>
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Method</label><select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none"><option value="bank">Bank</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="cheque">Cheque</option></select></div>
                <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none"><option value="pending">Pending</option><option value="received">Received</option><option value="completed">Completed</option></select></div>
              </div>
              <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Description</label><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Web design — April 2026" className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none" /></div>
              <button type="submit" className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold">{editingId ? 'Update' : 'Add Entry'}</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
