'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Lock, Check } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      })
      if (res.ok) {
        localStorage.setItem('moneyflow_auth', 'logged_in')
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-emerald-400 to-cyan-500 text-3xl font-black text-slate-950 shadow-2xl shadow-emerald-500/30 ring-8 ring-emerald-500/10 mb-6 font-mono">₹</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-slate-400 font-medium">Start your financial journey.</p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <Input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="yourname" autoComplete="username" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Check className="w-3.5 h-3.5" /> Confirm Password
              </label>
              <Input type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black text-lg gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-black transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <Link href="/auth/login" className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-600 hover:text-slate-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </div>
    </div>
  )
}
