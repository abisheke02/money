'use client'

import { useEffect, useState } from 'react'
import { Users, CreditCard, IndianRupee, Lightbulb, TrendingUp, Crown, Star, Circle } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalTransactions: number
  totalRevenue: number
  pendingFeatures: number
  plans: { free: number; pro: number; premium: number }
  recentUsers: {
    id: number; username: string; email: string; created_at: string
    plan: string | null; sub_status: string | null
  }[]
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('moneyflow_admin_auth')
    if (!raw) return
    const { token } = JSON.parse(raw)
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return <p className="text-slate-400">Failed to load stats.</p>

  const paidUsers = (stats.plans.pro ?? 0) + (stats.plans.premium ?? 0)
  const revenue = stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Platform-wide stats and recent activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Users"        value={stats.totalUsers}       color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={TrendingUp}   label="Transactions"       value={stats.totalTransactions} sub="across all users" color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={IndianRupee}  label="Total Revenue"      value={revenue}                color="bg-amber-500/20 text-amber-400" />
        <StatCard icon={Lightbulb}    label="Pending Features"   value={stats.pendingFeatures}  color="bg-violet-500/20 text-violet-400" />
      </div>

      {/* Plan breakdown */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Plan Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-slate-800/60 border border-white/5">
            <Circle className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.plans.free ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Free</p>
            <p className="text-[10px] text-slate-600">₹0/mo</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Star className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.plans.pro ?? 0}</p>
            <p className="text-xs text-cyan-400 mt-1">Pro</p>
            <p className="text-[10px] text-slate-500">₹199/mo</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Crown className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.plans.premium ?? 0}</p>
            <p className="text-xs text-amber-400 mt-1">Premium</p>
            <p className="text-[10px] text-slate-500">₹499/mo</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            {stats.totalUsers > 0 && (
              <>
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full"
                  style={{ width: `${(paidUsers / stats.totalUsers) * 100}%` }}
                />
              </>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {stats.totalUsers > 0 ? Math.round((paidUsers / stats.totalUsers) * 100) : 0}% paid
          </span>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{u.username}</td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <PlanBadge plan={u.plan} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'premium') return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">PREMIUM</span>
  if (plan === 'pro')     return <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">PRO</span>
  return <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold">FREE</span>
}
