'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, User } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('moneyflow_admin_auth', JSON.stringify({
          token: data.sessionToken,
          userId: data.userId,
          username: data.username,
        }))
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-sm">MoneyFlow — Restricted Access</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username or Email
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400 transition"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400 transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition shadow-lg shadow-violet-500/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sign In to Admin
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            Default: <code className="text-violet-400">admin</code> / <code className="text-violet-400">admin123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
