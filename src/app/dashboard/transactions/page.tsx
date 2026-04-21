'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X, Check, Download, Tags, Camera } from 'lucide-react'
import type { Transaction, Category } from '@/types'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { useCurrency } from '@/lib/contexts/CurrencyContext'
import { Scanner } from '@/app/components/Scanner'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/format'

export default function TransactionsPage() {
  const { activeBusiness, loading: businessLoading } = useBusiness()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const [deletedTransaction, setDeletedTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false)
  const [bulkCategoryId, setBulkCategoryId] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [filters, setFilters] = useState({ search: '', type: '', categoryId: '', method: '', startDate: '', endDate: '', sortBy: 'date', sortOrder: 'desc', page: 1, limit: 20 })
  const [total, setTotal] = useState(0)
  const { currentCurrency, currencies } = useCurrency()
  const [form, setForm] = useState({ type: 'debit' as 'credit' | 'debit', status: 'completed', amount: '', category_id: '', date: new Date().toISOString().split('T')[0], due_date: '', reminder_days: '3', note: '', method: 'cash', tags: '' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const resetForm = useCallback(() => { 
    setForm({ type: 'debit', status: 'completed', amount: '', category_id: '', date: new Date().toISOString().split('T')[0], due_date: '', reminder_days: '3', note: '', method: 'cash', tags: '' })
    setShowScanner(false)
  }, [])
  const showToast = useCallback((message: string, type: string) => { setToast({ message, type }); if (type !== 'undo') setTimeout(() => setToast(null), 3000) }, [])
  const fmt = useCallback((amount: number) => { const sym = currencies.find(c => c.code === currentCurrency)?.symbol ?? currentCurrency; return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }, [currentCurrency, currencies])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v && k !== 'page' && k !== 'limit') params.set(k, String(v)) })
      if (activeBusiness) params.set('businessId', activeBusiness.id.toString())
      params.set('page', filters.page.toString())
      params.set('limit', filters.limit.toString())
      const [txRes, catRes] = await Promise.all([fetch(`/api/transactions?${params}`), fetch('/api/categories')])
      const txData = await txRes.json(); const catData = await catRes.json()
      setTransactions(txData.transactions || []); setTotal(txData.total || 0); setCategories(catData || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [filters, activeBusiness])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { 
    if (searchParams.get('action') === 'add') setShowModal(true) 
    if (searchParams.get('action') === 'scan') { setShowModal(true); setShowScanner(true) }
  }, [searchParams])

  const totalPages = Math.ceil(total / filters.limit)
  const filteredCategories = useMemo(() => categories.filter((c: Category) => c.type === form.type || c.type === 'both'), [categories, form.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions'
      const payload = { 
        ...form, 
        amount: parseFloat(form.amount), 
        category_id: parseInt(form.category_id), 
        business_id: activeBusiness?.id, 
        currency: currentCurrency, 
        reminder_days: parseInt(form.reminder_days) || 3 
      }
      const res = await fetch(url, { 
        method: editingId ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (res.ok) { 
        setShowModal(false); 
        setEditingId(null); 
        resetForm(); 
        fetchData(); 
        showToast(editingId ? 'Updated' : 'Added', 'success') 
      } else {
        const errData = await res.json()
        showToast(errData.error || 'Failed to save', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Network error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tx: Transaction) => { setForm({ type: tx.type, status: (tx as any).status || 'completed', amount: tx.amount.toString(), category_id: tx.category_id.toString(), date: tx.date, due_date: tx.due_date || '', reminder_days: (tx.reminder_days || 3).toString(), note: tx.note || '', method: tx.method || 'cash', tags: tx.tags || '' }); setEditingId(tx.id); setShowModal(true) }
  const handleDelete = async (tx: Transaction) => { setDeletedTransaction(tx); await fetch(`/api/transactions/${tx.id}`, { method: 'DELETE' }); showToast('Deleted', 'undo'); fetchData() }
  const handleUndoDelete = async () => { if (!deletedTransaction) return; await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...deletedTransaction, business_id: activeBusiness?.id, currency: deletedTransaction.currency || currentCurrency }) }); fetchData(); setDeletedTransaction(null); showToast('Restored', 'success'); setTimeout(() => setToast(null), 3000) }
  const handleBulkDelete = async () => { for (const id of selectedIds) await fetch(`/api/transactions/${id}`, { method: 'DELETE' }); showToast(`${selectedIds.length} deleted`, 'success'); setSelectedIds([]); fetchData() }
  const handleBulkCategoryChange = async () => {
    if (!bulkCategoryId) return
    const res = await fetch('/api/transactions/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, updates: { category_id: parseInt(bulkCategoryId) } })
    })
    if (res.ok) {
      showToast(`${selectedIds.length} updated`, 'success')
      setSelectedIds([])
      setShowBulkCategoryModal(false)
      setBulkCategoryId('')
      fetchData()
    }
  }

  const handleScanComplete = (data: { amount: string; date: string; note: string; category?: string }) => {
    let category_id = form.category_id
    if (data.category) {
      const match = categories.find(c => c.name.toLowerCase() === data.category?.toLowerCase())
      if (match) category_id = match.id.toString()
    }
    setForm(f => ({ ...f, amount: data.amount, date: data.date || f.date, note: data.note || f.note, type: 'debit', category_id }))
    setShowScanner(false)
    showToast('Scan successful!', 'success')
  }

  const handleExport = async () => { const params = new URLSearchParams(); if (activeBusiness) params.set('businessId', activeBusiness.id.toString()); const res = await fetch(`/api/export?format=csv&${params}`); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click(); URL.revokeObjectURL(url) }
  const toggleSelect = (id: number) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === transactions.length ? [] : transactions.map(t => t.id))

  return (
    <div className="transactions-page-container">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
            <p className="text-sm text-slate-400 font-medium">Manage and track your financial flow</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <Button variant="outline" size="sm" onClick={() => setShowBulkCategoryModal(true)} className="gap-2">
                  <Tags className="w-4 h-4" /> <span className="hidden md:inline">Change Category</span>
                </Button>
                <Button variant="danger" size="sm" onClick={handleBulkDelete} className="gap-2">
                  <Trash2 className="w-4 h-4" /> <span>Delete {selectedIds.length}</span>
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> <span className="hidden md:inline">Export</span>
            </Button>
            <Button onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }} className="gap-2 px-6">
              <Plus className="w-4 h-4" /> Add New
            </Button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input id="search-input" type="text" placeholder="Search notes, tags..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} className="w-full rounded-xl border border-white/10 bg-slate-800/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition ${showFilters ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400'}`}>
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md animate-fadeIn">
            <Select label="Type" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))} options={[{ label: 'All Types', value: '' }, { label: 'Credit', value: 'credit' }, { label: 'Debit', value: 'debit' }]} />
            <Select label="Category" value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value, page: 1 }))} options={[{ label: 'All Categories', value: '' }, ...categories.map(c => ({ label: c.name, value: c.id }))]} />
            <Input label="From Date" type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))} />
            <Input label="To Date" type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))} />
          </div>
        )}

        {/* Table */}
        <div className="rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          {loading || businessLoading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm gap-4 animate-fadeIn">
              <div className="p-4 rounded-full bg-white/5 text-slate-600"><Search className="w-8 h-8" /></div>
              <div className="text-center">
                <p className="font-semibold text-slate-300">No transactions found</p>
                <p className="text-xs">Try adjusting your filters or add a new record.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>Add Transaction</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 px-4 py-2">
                <thead className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-4 py-4 text-left w-10"><button onClick={toggleSelectAll} className="p-2 hover:bg-white/5 rounded-xl transition"><Check className={cn("w-4 h-4", selectedIds.length === transactions.length ? "text-primary" : "text-slate-600")} /></button></th>
                    <th className="px-4 py-4 text-left">Timestamp</th>
                    <th className="px-4 py-4 text-left">Description</th>
                    <th className="px-4 py-4 text-left">Category</th>
                    <th className="px-4 py-4 text-left">Method</th>
                    <th className="px-4 py-4 text-right">Amount</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="">
                  {transactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="group bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300 shadow-sm">
                      <td className="px-4 py-4 rounded-l-2xl"><button onClick={() => toggleSelect(tx.id)} className="p-2 hover:bg-white/5 rounded-xl transition"><Check className={cn("w-4 h-4", selectedIds.includes(tx.id) ? "text-primary" : "text-slate-600/50 group-hover:text-slate-600")} /></button></td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white font-mono">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(tx.date).getFullYear()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-black text-white truncate max-w-[200px] group-hover:text-primary transition-colors">{tx.note || tx.category?.name || '—'}</div>
                        {tx.tags && <div className="flex gap-1 mt-1">{tx.tags.split(',').map(tag => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 border border-white/5 font-bold">#{tag.trim()}</span>)}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: tx.category?.color || '#ccc' }} />
                          <span className="text-sm text-slate-300 font-bold">{tx.category?.name || 'Uncategorized'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                         <Badge variant={tx.type as any} className="font-black text-[10px] uppercase">{tx.method || 'Cash'}</Badge>
                      </td>
                      <td className={cn("px-4 py-4 text-right font-black text-base font-mono tabular-nums", tx.type === 'credit' ? "text-emerald-400" : "text-rose-400")}>
                        {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                      <td className="px-4 py-4 text-right rounded-r-2xl">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleEdit(tx)} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(tx)} className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-black/20 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Page <span className="text-white">{filters.page}</span> of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page === 1} className="px-4 rounded-xl border-white/5"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page === totalPages} className="px-4 rounded-xl border-white/5"><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} 
        title={showScanner ? 'Scan Bill' : editingId ? 'Edit Transaction' : 'Add Transaction'}>
        <div className="absolute right-14 top-5">
           {!editingId && !showScanner && (
            <Button variant="ghost" size="sm" onClick={() => setShowScanner(true)} title="Scan Receipt">
              <Camera className="w-5 h-5 text-primary" />
            </Button>
          )}
        </div>

        {showScanner ? (
          <Scanner onScanComplete={handleScanComplete} onClose={() => setShowScanner(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <div className="p-1 bg-secondary rounded-2xl flex gap-1 border border-border/50">
              <button type="button" onClick={() => setForm(f => ({ ...f, type: 'debit', status: 'completed', category_id: '' }))}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all", form.type === 'debit' && form.status !== 'pending' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-muted-foreground hover:text-foreground")}>
                Expense
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, type: 'credit', status: 'completed', category_id: '' }))}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all", form.type === 'credit' && form.status !== 'pending' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-muted-foreground hover:text-foreground")}>
                Income
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, status: 'pending' }))}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all", form.status === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-muted-foreground hover:text-foreground")}>
                Pending
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount" type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" autoFocus />
              <Select label="Category" required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} options={[{ label: 'Select', value: '' }, ...filteredCategories.map(c => ({ label: c.name, value: c.id }))]} />
            </div>

            <Input label="Note" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="What was this for?" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <Select label="Method" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} options={[{ label: 'Cash', value: 'cash' }, { label: 'Card', value: 'card' }, { label: 'Bank', value: 'bank' }, { label: 'UPI', value: 'upi' }, { label: 'Other', value: 'other' }]} />
            </div>

            {form.status === 'pending' && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                <Input label="Reminder (Days)" type="number" min="1" max="30" value={form.reminder_days} onChange={e => setForm(f => ({ ...f, reminder_days: e.target.value }))} />
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full py-4 text-base mt-2" variant={form.status === 'pending' ? 'primary' : form.type === 'debit' ? 'danger' : 'primary'}>
              {editingId ? 'Update Transaction' : form.status === 'pending' ? 'Save Pending' : form.type === 'debit' ? 'Add Expense' : 'Add Income'}
            </Button>
          </form>
        )}
      </Modal>

      {/* Bulk Category Modal */}
      <Modal isOpen={showBulkCategoryModal} onClose={() => setShowBulkCategoryModal(false)} title={`Change Category (${selectedIds.length})`}>
        <div className="space-y-6 py-2">
          <Select label="Batch Update To" value={bulkCategoryId} onChange={e => setBulkCategoryId(e.target.value)} options={[{ label: 'Select Category', value: '' }, ...categories.map(c => ({ label: c.name, value: c.id }))]} />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowBulkCategoryModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleBulkCategoryChange} disabled={!bulkCategoryId} className="flex-1">Apply Changes</Button>
          </div>
        </div>
      </Modal>

      {toast && isMounted && createPortal(
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 border px-5 py-2.5 rounded-full shadow-2xl z-[60] flex items-center gap-3 text-sm animate-slideIn ${
          toast.type === 'error' ? 'bg-rose-900 border-rose-500 text-rose-100' : 'bg-slate-900 border-white/10 text-white'
        }`}>
          <span>{toast.message}</span>
          {toast.type === 'undo' && <button onClick={handleUndoDelete} className="text-emerald-400 font-bold hover:text-emerald-300">Undo</button>}
          <button onClick={() => setToast(null)} className="ml-2 text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
        </div>,
        document.body
      )}
    </div>
  )
}
