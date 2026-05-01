'use client'

import React, { useState } from 'react'
import { Check, X, ShieldAlert, Sparkles, Loader2 } from 'lucide-react'

// Define Window integration for Razorpay SDK
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function UpgradeModal({ 
  userId, 
  onClose,
  onSuccess
}: { 
  userId: string, 
  onClose: () => void,
  onSuccess: (plan: string) => void
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (plan: 'pro' | 'premium') => {
    try {
      setLoadingPlan(plan)
      setError(null)

      // 1. Create order on internal server API
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // 2. Open Razorpay Checkot Window
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MoneyFlow Ecosystem',
        description: `Upgrade to ${plan.toUpperCase()}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                plan
              })
            })
            
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.success) {
               onSuccess(plan)
               onClose()
            } else {
               setError('Security verification failed. Contact support.')
            }
          } catch (err) {
            setError('Failed to verify payment with server.')
          }
        },
        theme: {
          color: '#10b981'
        }
      }

      const rzp1 = new window.Razorpay(options)
      rzp1.on('payment.failed', function (response: any) {
         setError(`Payment Failed: ${response.error.description}`)
         setLoadingPlan(null)
      })
      rzp1.open()

    } catch (err: any) {
      setError(err.message)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
       <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-4xl p-8 relative shadow-2xl flex flex-col">
          <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-10">
             <h2 className="text-3xl font-black text-white">Upgrade Your Intelligence</h2>
             <p className="text-slate-400 mt-2">Unlock unlimited transactions, AI insights, and OCR receipt scanning.</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Free Plan */}
             <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col items-center">
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Basic</p>
                <div className="text-4xl font-black text-white mb-6">Free</div>
                <ul className="space-y-4 text-sm text-slate-400 w-full mb-8 flex-1">
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Up to 50 transactions</li>
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Base analytics</li>
                   <li className="flex items-center gap-3 text-slate-600"><X className="w-4 h-4" /> No OCR Scanner</li>
                   <li className="flex items-center gap-3 text-slate-600"><X className="w-4 h-4" /> No AI Insights</li>
                </ul>
                <button disabled className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-bold uppercase cursor-not-allowed">
                  Current Plan
                </button>
             </div>

             {/* Pro Plan */}
             <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6 flex flex-col items-center relative shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                <p className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2">Pro</p>
                <div className="text-4xl font-black text-white mb-2">₹199<span className="text-lg text-slate-500">/mo</span></div>
                <p className="text-[10px] text-cyan-500/50 font-bold uppercase tracking-widest mb-6">Billed Monthly</p>
                <ul className="space-y-4 text-sm text-slate-300 w-full mb-8 flex-1">
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /> Unlimited Transactions</li>
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /> Export to CSV</li>
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /> Advanced Analytics</li>
                   <li className="flex items-center gap-3 text-slate-600"><X className="w-4 h-4" /> No OCR Scanner</li>
                </ul>
                <button 
                  onClick={() => handleCheckout('pro')}
                  disabled={!!loadingPlan}
                  className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase transition-all flex items-center justify-center gap-2">
                  {loadingPlan === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Pro'}
                </button>
             </div>

             {/* Premium Plan */}
             <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col items-center relative shadow-[0_0_40px_rgba(245,158,11,0.1)] transform md:-translate-y-4">
                <div className="absolute -top-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full flex items-center gap-1 shadow-lg">
                   <Sparkles className="w-3 h-3" /> Most Popular
                </div>
                <p className="text-sm font-black text-amber-400 uppercase tracking-widest mb-2 mt-2">Premium</p>
                <div className="text-4xl font-black text-white mb-2">₹499<span className="text-lg text-slate-500">/mo</span></div>
                <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest mb-6">Billed Monthly</p>
                <ul className="space-y-4 text-sm text-slate-300 w-full mb-8 flex-1">
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400" /> Everything in Pro</li>
                   <li className="flex items-center gap-3 font-bold text-amber-200"><Check className="w-4 h-4 text-amber-400" /> OCR Receipt Scanner</li>
                   <li className="flex items-center gap-3 font-bold text-amber-200"><Check className="w-4 h-4 text-amber-400" /> AI Financial Advisor</li>
                   <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400" /> Priority Support</li>
                </ul>
                <button 
                  onClick={() => handleCheckout('premium')}
                  disabled={!!loadingPlan}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-black uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2">
                  {loadingPlan === 'premium' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Premium'}
                </button>
             </div>
          </div>
       </div>
    </div>
  )
}
