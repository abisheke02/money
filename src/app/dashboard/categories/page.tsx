'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, X, Tag, CreditCard, Car, Home, Zap, Film, Heart, BookOpen, User, Package, Laptop, Gift, Briefcase, TrendingUp, RotateCcw, Lock } from 'lucide-react'
import type { Category } from '@/types'
import { usePlan } from '@/lib/contexts/PlanContext'
import Link from 'next/link'

const iconComponents: Record<string, any> = {
  'shopping-cart': Tag, 'utensils': CreditCard, 'car': Car, 'home': Home, 'zap': Zap,
  'film': Film, 'heart': Heart, 'book-open': BookOpen, 'user': User, 'package': Package,
  'briefcase': Briefcase, 'laptop': Laptop, 'gift': Gift, 'trending-up': TrendingUp, 'rotate-ccw': RotateCcw, 'plus-circle': Plus,
}
const colorOptions = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1']

export default function CategoriesPage() {
  const { can } = usePlan()
  const canEdit = can('editCategories')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', icon: 'package', color: '#10B981', type: 'debit' as 'credit' | 'debit' | 'both' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const fetchCategories = useCallback(async () => {
    try { const res = await fetch('/api/categories'); setCategories(await res.json()) } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const showT = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }
  const resetForm = () => setForm({ name: '', icon: 'package', color: '#10B981', type: 'debit' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
    const res = await fetch(url, { method: editingCategory ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { showT(editingCategory ? 'Updated' : 'Created'); setShowModal(false); setEditingCategory(null); resetForm(); fetchCategories() }
  }

  const handleEdit = (cat: Category) => { setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type }); setEditingCategory(cat); setShowModal(true) }
  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?`)) return
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
    if (res.ok) { showT('Deleted'); fetchCategories() } else { const d = await res.json(); showT(d.error || 'Cannot delete') }
  }

  const debitCats = categories.filter(c => c.type === 'debit' || c.type === 'both')
  const creditCats = categories.filter(c => c.type === 'credit' || c.type === 'both')

  const CatRow = ({ cat }: { cat: Category }) => {
    const Icon = iconComponents[cat.icon] || Package
    return (
      <tr className="border-b border-white/5 hover:bg-white/5 transition">
        <td className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
              <Icon className="w-3 h-3" style={{ color: cat.color }} />
            </div>
            <span className="text-xs text-white font-medium">{cat.name}</span>
          </div>
        </td>
        <td className="px-3 py-1.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cat.type === 'credit' ? 'bg-emerald-500/10 text-emerald-300' : cat.type === 'both' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-rose-500/10 text-rose-300'}`}>{cat.type}</span></td>
        <td className="px-3 py-1.5">
          <div className="flex gap-1 justify-end">
            {canEdit ? (
              <>
                <button onClick={() => handleEdit(cat)} className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded transition"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(cat)} className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"><Trash2 className="w-3 h-3" /></button>
              </>
            ) : (
              <Lock className="w-3 h-3 text-slate-700" />
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">Categories</h1>
          <p className="text-[10px] text-slate-400">{categories.length} total {!canEdit && <span className="text-amber-400 ml-1">· View only on Free plan</span>}</p>
        </div>
        {canEdit ? (
          <button onClick={() => { resetForm(); setEditingCategory(null); setShowModal(true) }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition">
            <Plus className="w-3 h-3" /> Add
          </button>
        ) : (
          <Link href="/dashboard/pricing" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition">
            <Lock className="w-3 h-3" /> Upgrade to Edit
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[{ title: 'Expense', cats: debitCats }, { title: 'Income', cats: creditCats }].map(({ title, cats }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/10 bg-slate-800/30">
                <p className="text-xs font-semibold text-white">{title} Categories <span className="text-slate-500 font-normal">({cats.length})</span></p>
              </div>
              <table className="w-full">
                <tbody>
                  {cats.map(cat => <CatRow key={cat.id} cat={cat} />)}
                  {cats.length === 0 && <tr><td colSpan={3} className="px-3 py-4 text-center text-[10px] text-slate-500">None yet</td></tr>}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {showModal && isMounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">{editingCategory ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => { setShowModal(false); resetForm() }}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Name</label><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="Category name" autoFocus /></div>
              <div><label className="block text-[10px] font-medium text-slate-400 mb-1">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none"><option value="debit">Expense</option><option value="credit">Income</option><option value="both">Both</option></select></div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {colorOptions.map(color => (
                    <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))} className={`w-6 h-6 rounded-lg transition-transform ${form.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold">{editingCategory ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {toast && isMounted && createPortal(
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-4 py-2 rounded-full shadow-2xl z-[60] text-xs">{toast}</div>,
        document.body
      )}
    </div>
  )
}
