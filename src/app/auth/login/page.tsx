'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, Wallet, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doLogin = async (username: string, password: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        localStorage.setItem('moneyflow_auth', 'logged_in')
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doLogin(form.username, form.password)
  }

  const handleDemoLogin = () => {
    setForm({ username: 'demo', password: 'demo' })
    doLogin('demo', 'demo')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="absolute -top-12 left-0 p-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
            <span className="text-2xl font-black text-slate-950">₹</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Money Flow</h1>
          <p className="text-slate-400 text-sm">Smart Finance Dashboard</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-60"
          >
            <Zap className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Try Demo — One Click Login'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">or sign in manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Username or Email
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 transition"
                placeholder="demo"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-slate-500">
              No account?{' '}
              <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Create one
              </Link>
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Demo credentials: <code className="text-emerald-400">demo</code> / <code className="text-emerald-400">demo</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
