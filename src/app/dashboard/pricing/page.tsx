'use client'

import { useState } from 'react'
import { usePlan, PLAN_FEATURES, PLAN_LABELS, Plan } from '@/lib/contexts/PlanContext'
import { Check, X, Zap, Crown, Sparkles, CheckCircle } from 'lucide-react'
import UpgradeModal from '@/components/payments/UpgradeModal'

const plans: { key: Plan; icon: any; features: string[]; locked: string[] }[] = [
  {
    key: 'free',
    icon: Zap,
    features: ['1 Business', 'Transactions (add/view)', 'Basic Dashboard', 'Calculator'],
    locked: ['Edit Categories', 'Overall Reports', 'Receivables', 'Export Data', 'AI Advisor', 'Multiple Businesses'],
  },
  {
    key: 'pro',
    icon: Crown,
    features: ['Up to 3 Businesses', 'Full Transactions', 'Edit & Add Categories', 'Overall Reports', 'Receivables & Payables', 'Export CSV', 'Calculator'],
    locked: ['AI Investment Advisor', 'Export JSON', 'Unlimited Businesses'],
  },
  {
    key: 'premium',
    icon: Sparkles,
    features: ['Unlimited Businesses', 'All Pro Features', 'AI Investment Advisor', 'Export CSV & JSON', 'Edit Categories', 'Receivables', 'Priority Support'],
    locked: [],
  },
]

export default function PricingPage() {
  const { plan: currentPlan, setPlan, refresh } = usePlan()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro')
  const [successPlan, setSuccessPlan] = useState<string | null>(null)

  const userId = typeof window !== 'undefined'
    ? (localStorage.getItem('moneyflow_user_id') ?? '1')
    : '1'

  const handleActivate = (p: Plan) => {
    if (p === 'free') { setPlan('free'); return }
    setSelectedPlan(p as 'pro' | 'premium')
    setShowUpgrade(true)
  }

  const handlePaymentSuccess = async (plan: string) => {
    setPlan(plan as Plan)
    await refresh()
    setSuccessPlan(plan)
    setShowUpgrade(false)
    setTimeout(() => setSuccessPlan(null), 4000)
  }

  return (
    <div className="space-y-3">
      {successPlan && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Payment successful! You are now on the {successPlan.toUpperCase()} plan.
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal
          userId={userId}
          onClose={() => setShowUpgrade(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div>
        <h1 className="text-base font-bold text-white">Plans & Pricing</h1>
        <p className="text-[10px] text-slate-400">Choose the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {plans.map(({ key, icon: Icon, features, locked }) => {
          const label = PLAN_LABELS[key]
          const isCurrent = currentPlan === key
          const isPremium = key === 'premium'
          const isPro = key === 'pro'

          return (
            <div key={key} className={`relative rounded-2xl border p-4 flex flex-col gap-3 transition ${
              isPremium ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent' :
              isPro     ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent' :
                          'border-white/10 bg-white/5'
            }`}>
              {isPro && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
                  POPULAR
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isPremium ? 'bg-amber-500/20' : isPro ? 'bg-cyan-500/20' : 'bg-slate-700'
                }`}>
                  <Icon className={`w-4 h-4 ${label.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{label.name}</p>
                  <p className={`text-xs font-semibold ${label.color}`}>{label.price}</p>
                </div>
                {isCurrent && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${label.badge}`}>Active</span>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-1.5">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] text-slate-300">{f}</span>
                  </div>
                ))}
                {locked.map(f => (
                  <div key={f} className="flex items-center gap-1.5 opacity-40">
                    <X className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="text-[11px] text-slate-500 line-through">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleActivate(key)}
                disabled={isCurrent}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-slate-700 text-slate-400 cursor-default'
                    : isPremium
                    ? 'bg-amber-500 text-white hover:bg-amber-400 shadow shadow-amber-500/30'
                    : isPro
                    ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow shadow-cyan-500/30'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}>
                {isCurrent ? '✓ Current Plan' : key === 'free' ? 'Downgrade to Free' : `Upgrade to ${label.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature comparison table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 bg-slate-800/30">
          <p className="text-xs font-semibold text-white">Feature Comparison</p>
        </div>
        <table className="w-full text-xs">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-400">Feature</th>
              {plans.map(p => (
                <th key={p.key} className={`px-3 py-2 text-center text-[10px] font-bold ${PLAN_LABELS[p.key].color}`}>
                  {PLAN_LABELS[p.key].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { label: 'Businesses', values: ['1', 'Up to 3', 'Unlimited'] },
              { label: 'Transactions', values: ['✓', '✓', '✓'] },
              { label: 'Dashboard', values: ['Basic', 'Full', 'Full'] },
              { label: 'Edit Categories', values: ['✗', '✓', '✓'] },
              { label: 'Overall Reports', values: ['✗', '✓', '✓'] },
              { label: 'Receivables', values: ['✗', '✓', '✓'] },
              { label: 'Export CSV', values: ['✗', '✓', '✓'] },
              { label: 'Export JSON', values: ['✗', '✗', '✓'] },
              { label: 'AI Advisor', values: ['✗', '✗', '✓'] },
              { label: 'Calculator', values: ['✓', '✓', '✓'] },
            ].map(({ label, values }) => (
              <tr key={label} className="hover:bg-white/5">
                <td className="px-3 py-1.5 text-slate-300">{label}</td>
                {values.map((v, i) => (
                  <td key={i} className={`px-3 py-1.5 text-center font-medium ${
                    v === '✓' || v === 'Full' || v === 'Unlimited' ? 'text-emerald-400' :
                    v === '✗' ? 'text-slate-600' : 'text-slate-300'
                  }`}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
