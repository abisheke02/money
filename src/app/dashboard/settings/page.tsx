'use client'

import { useState } from 'react'
import { Download, Upload, Info } from 'lucide-react'
import { CurrencySelector } from '@/app/components/CurrencySelector'
import { useBusiness } from '@/lib/contexts/BusinessContext'

export default function SettingsPage() {
  const { activeBusiness } = useBusiness()
  const [toast, setToast] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const showT = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleExport = async (format: 'csv' | 'json') => {
    const params = new URLSearchParams()
    if (activeBusiness) params.set('businessId', activeBusiness.id.toString())
    const res = await fetch(`/api/export?format=${format}&${params}`)
    const blob = format === 'json' ? new Blob([JSON.stringify(await res.json(), null, 2)], { type: 'application/json' }) : await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `moneyflow_${activeBusiness?.name || 'export'}.${format}`; a.click(); URL.revokeObjectURL(url)
    showT(`Exported as ${format.toUpperCase()}`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setImporting(true)
    try {
      // 1. Fetch categories for mapping
      const catsRes = await fetch('/api/categories')
      const categories = await catsRes.json() as any[]
      
      const text = await file.text()
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      
      const transactionsToCreate: any[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((h, idx) => { row[h] = vals[idx] })

        if (!row.date || !row.amount) continue

        // Map category name to ID
        const categoryName = row.category || 'Other'
        const catMatch = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
        const category_id = catMatch ? catMatch.id : (categories.find(c => c.name === 'Other')?.id || categories[0]?.id || 1)

        transactionsToCreate.push({
          type: (row.type?.toLowerCase() === 'credit' ? 'credit' : 'debit'),
          amount: parseFloat(row.amount.replace(/[^0-9.-]/g, '')) || 0,
          category_id,
          business_id: activeBusiness?.id,
          currency: row.currency || 'INR',
          date: row.date,
          status: 'completed',
          reminder_days: 0,
          note: row.note || '',
          method: row.method || 'cash',
          tags: row.tags || ''
        })
      }

      if (transactionsToCreate.length > 0) {
        const res = await fetch('/api/transactions/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: transactionsToCreate })
        })
        if (!res.ok) throw new Error('Bulk insert failed')
        showT(`Imported ${transactionsToCreate.length} transactions`)
      } else {
        showT('No valid transactions found')
      }
    } catch (err) { 
      console.error(err)
      showT('Import failed') 
    } finally { 
      setImporting(false); 
      e.target.value = '' 
    }
  }

  const sections = [
    {
      icon: <Download className="w-3.5 h-3.5 text-emerald-400" />, title: 'Export Data', desc: 'Download your data',
      content: (
        <div className="flex gap-2 mt-2">
          {(['csv', 'json'] as const).map(fmt => (
            <button key={fmt} onClick={() => handleExport(fmt)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition">
              <Download className="w-3 h-3" /> {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )
    },
    {
      icon: <Upload className="w-3.5 h-3.5 text-blue-400" />, title: 'Import CSV', desc: 'Import transactions from file',
      content: (
        <div className="mt-2">
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-800/30 p-3">
            <input type="file" accept=".csv" onChange={handleImport} disabled={importing} className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/20 file:text-emerald-300 file:cursor-pointer" />
            {importing && <div className="mt-2 flex items-center gap-2 text-slate-400 text-xs"><div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />Importing...</div>}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Format: Date, Type, Amount, Category, Note, Method, Tags</p>
        </div>
      )
    },
    {
      icon: <Info className="w-3.5 h-3.5 text-violet-400" />, title: 'About MoneyFlow', desc: 'v1.0.0 — Next.js + SQLite + Tailwind',
      content: (
        <p className="mt-2 text-[10px] text-slate-500">
          Keyboard shortcuts: <span className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">A</span> add transaction,{' '}
          <span className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">/</span> search
        </p>
      )
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-base font-bold text-white">Settings</h1>
        <p className="text-[10px] text-slate-400">Manage preferences & data</p>
      </div>

      {/* Currency */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-semibold text-white mb-2">Currency</p>
        <CurrencySelector />
      </div>

      {/* Other sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map(({ icon, title, desc, content }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">{icon}</div>
              <p className="text-xs font-semibold text-white">{title}</p>
            </div>
            <p className="text-[10px] text-slate-400 ml-8">{desc}</p>
            {content}
          </div>
        ))}
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-4 py-2 rounded-full shadow-2xl z-50 text-xs">{toast}</div>}
    </div>
  )
}
