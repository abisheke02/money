'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet, Receipt, BarChart3, Sparkles, TrendingUp, Brain,
  Shield, Lock, CheckCircle, Globe, ChevronLeft, ChevronRight,
  ArrowRight, Star
} from 'lucide-react'

const features = [
  {
    icon: Wallet,
    title: 'Track Income',
    desc: 'Track all your income in one place. Every credit, every source — always visible.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    stat: '₹2,35,000',
    statLabel: 'Income this month',
  },
  {
    icon: Receipt,
    title: 'Manage Expenses',
    desc: 'Categorize & manage expenses easily. Know exactly where your money goes.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    stat: '₹89,770',
    statLabel: 'Expenses tracked',
  },
  {
    icon: BarChart3,
    title: 'Smart Insights',
    desc: 'Get AI-powered insights to save more. Understand your spending patterns instantly.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    stat: '+12.5%',
    statLabel: 'Monthly growth',
  },
  {
    icon: TrendingUp,
    title: 'Business Analytics',
    desc: 'Understand your business performance deeply. Multi-business reports in one view.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    stat: '₹1,45,230',
    statLabel: 'Net profit tracked',
  },
  {
    icon: Brain,
    title: 'AI Finance Tools',
    desc: 'Smart recommendations for better decisions. Powered by Claude AI — gold, SIP, FD advice.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    stat: 'AI',
    statLabel: 'Powered by Claude',
  },
]

export default function LandingPage() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (dir: 'prev' | 'next') => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(c => dir === 'next' ? (c + 1) % features.length : (c - 1 + features.length) % features.length)
      setAnimating(false)
    }, 200)
  }

  useEffect(() => {
    const t = setInterval(() => go('next'), 3500)
    return () => clearInterval(t)
  }, [])

  const feat = features[current]

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={36} height={36} className="rounded-xl" />
            <span className="text-xl font-black tracking-tight">moneylix</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#trust" className="hover:text-white transition">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">

          {/* Left */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Image src="/logos/moneylix-mark.svg" alt="M" width={44} height={44} className="rounded-2xl" />
              <span className="text-2xl font-black tracking-tight text-emerald-400">moneylix</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
              <span className="text-white">SMART</span><br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">FINANCE</span><br />
              <span className="text-white">MANAGEMENT</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              Track <span className="text-emerald-400 font-semibold">income</span>, manage{' '}
              <span className="text-emerald-400 font-semibold">expenses</span> &amp; grow your money smarter.
            </p>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium">
                For <span className="text-emerald-400 font-bold">freelancers</span>,{' '}
                <span className="text-emerald-400 font-bold">creators</span> &amp;{' '}
                <span className="text-emerald-400 font-bold">small businesses</span> in India.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-base shadow-2xl shadow-emerald-500/25 hover:opacity-90 transition active:scale-95">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-base hover:bg-white/10 transition">
                Sign In
              </Link>
            </div>

            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> www.moneylix.in &nbsp;·&nbsp; 🇮🇳 Made for India
            </p>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[44px] border-[6px] border-slate-700 shadow-2xl shadow-black/60 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-8 bg-slate-900 flex items-center justify-center z-10">
                  <div className="w-24 h-5 bg-slate-800 rounded-full" />
                </div>
                {/* Status bar */}
                <div className="absolute top-8 inset-x-0 px-5 flex items-center justify-between z-10">
                  <span className="text-[10px] text-white font-bold">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 items-end h-3">
                      {[3,4,5,6].map(h => <div key={h} className="w-1 bg-white rounded-sm" style={{height:`${h*2}px`}} />)}
                    </div>
                    <div className="w-5 h-2.5 rounded-sm border border-white/50 ml-1">
                      <div className="w-3/4 h-full bg-white rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Screen content */}
                <div className="absolute top-16 inset-x-0 bottom-0 bg-[#0d1117] overflow-hidden px-4 py-3 space-y-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Overview</p>

                  {/* Balance card */}
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 p-3">
                    <p className="text-[9px] text-slate-400 font-medium">Total Balance</p>
                    <p className="text-xl font-black text-white mt-1">₹1,45,230</p>
                    <p className="text-[9px] text-emerald-400 font-bold mt-0.5">+12.5% vs last month</p>
                  </div>

                  {/* Income/Expense bars */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">Income</span>
                      <span className="text-[9px] text-emerald-400 font-bold">₹2,35,000</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full w-4/5" /></div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">Expenses</span>
                      <span className="text-[9px] text-rose-400 font-bold">₹89,770</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-rose-500 rounded-full w-2/5" /></div>
                  </div>

                  {/* Chart */}
                  <div className="rounded-xl bg-slate-800/50 border border-white/5 p-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-white font-bold">Cash Flow</span>
                      <span className="text-[8px] text-slate-500">This Month</span>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {[40,55,35,70,50,85,65,90,75,80,95,85].map((h,i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{height:`${h}%`, background: i >= 9 ? '#10b981' : '#1e293b'}} />
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center justify-end">
                      <span className="text-[8px] text-emerald-400 font-black bg-emerald-500/10 px-1.5 py-0.5 rounded">+₹45,230</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="rounded-xl bg-slate-800/50 border border-white/5 p-2.5">
                    <p className="text-[9px] text-white font-bold mb-2">Expenses by Category</p>
                    <div className="space-y-1.5">
                      {[
                        { name: 'Office', pct: 40, color: 'bg-cyan-500' },
                        { name: 'Marketing', pct: 27, color: 'bg-violet-500' },
                        { name: 'Travel', pct: 20, color: 'bg-amber-500' },
                      ].map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
                          <span className="text-[8px] text-slate-400 flex-1">{c.name}</span>
                          <div className="w-16 h-1 bg-slate-700 rounded-full">
                            <div className={`h-full rounded-full ${c.color}`} style={{width:`${c.pct}%`}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="absolute bottom-0 inset-x-0 h-14 bg-slate-900 border-t border-white/5 flex items-center justify-around px-4">
                  {['Overview','Transactions','Reports','More'].map((label, i) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-emerald-500/30' : 'bg-slate-700'}`} />
                      <span className={`text-[7px] font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -right-16 top-16 bg-slate-800/90 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-xl w-36">
                <p className="text-[8px] text-slate-400 font-bold">Monthly Growth</p>
                <p className="text-emerald-400 font-black text-lg">+12.5%</p>
                <div className="flex items-end gap-0.5 h-5 mt-1">
                  {[4,6,5,8,7,9,10].map((h,i) => <div key={i} className="flex-1 bg-emerald-500 rounded-sm opacity-60" style={{height:`${h*2}px`}} />)}
                </div>
              </div>
              <div className="absolute -left-12 bottom-28 bg-slate-800/90 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-xl w-36">
                <p className="text-[8px] text-slate-400 font-bold">Income vs Expenses</p>
                <p className="text-emerald-400 font-black">+₹1,45,230</p>
                <div className="flex gap-1 mt-1">
                  {[3,5,4,7,6].map((h,i) => <div key={i} className="flex-1 bg-cyan-500/50 rounded-sm" style={{height:`${h*3}px`}} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Slider ── */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-3">What we offer</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything you need</h2>
          </div>

          <div className="relative">
            {/* Slide */}
            <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Left — feature content */}
                <div className="space-y-6">
                  <div className={`inline-flex w-16 h-16 rounded-3xl ${feat.bg} border items-center justify-center`}>
                    <feat.icon className={`w-8 h-8 ${feat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                      Feature {current + 1} of {features.length}
                    </p>
                    <h3 className="text-4xl font-black text-white mb-4">{feat.title}</h3>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-md">{feat.desc}</p>
                  </div>
                  <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${feat.bg} border`}>
                    <span className={`text-3xl font-black font-mono ${feat.color}`}>{feat.stat}</span>
                    <span className="text-sm text-slate-400">{feat.statLabel}</span>
                  </div>
                </div>

                {/* Right — feature card visual */}
                <div className={`rounded-3xl border ${feat.bg} p-10 flex items-center justify-center min-h-[280px]`}>
                  <div className="text-center space-y-4">
                    <div className={`w-24 h-24 rounded-[32px] ${feat.bg} border flex items-center justify-center mx-auto`}>
                      <feat.icon className={`w-12 h-12 ${feat.color}`} />
                    </div>
                    <p className={`text-5xl font-black font-mono ${feat.color}`}>{feat.stat}</p>
                    <p className="text-slate-400 font-medium">{feat.statLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-10">
              <button onClick={() => go('prev')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-center gap-2">
                {features.map((_, i) => (
                  <button key={i} onClick={() => { setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false) }, 200) }}
                    className={`rounded-full transition-all ${i === current ? 'w-8 h-2.5 bg-emerald-400' : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'}`}
                  />
                ))}
              </div>

              <button onClick={() => go('next')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-3">Simple pricing</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Start free, upgrade when ready</h2>
            <p className="text-slate-400 mt-4">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name:'Free', price:'₹0', period:'forever', color:'text-slate-400', border:'border-white/10', bg:'bg-white/5', features:['1 Business','Basic Dashboard','Transactions','Calculator'], locked:['Reports','Receivables','AI Advisor'], cta:'Get Started Free', ctaStyle:'bg-slate-700 text-white hover:bg-slate-600' },
              { name:'Pro', price:'₹199', period:'/month', color:'text-cyan-400', border:'border-cyan-500/30', bg:'bg-cyan-500/5', badge:'POPULAR', features:['3 Businesses','Full Transactions','Reports & Analytics','Receivables','Export CSV'], locked:['AI Advisor'], cta:'Get Pro', ctaStyle:'bg-cyan-500 text-slate-950 hover:bg-cyan-400' },
              { name:'Premium', price:'₹499', period:'/month', color:'text-amber-400', border:'border-amber-500/30', bg:'bg-amber-500/5', badge:'BEST VALUE', features:['Unlimited Businesses','All Pro Features','AI Investment Advisor','Export CSV & JSON','Priority Support'], locked:[], cta:'Get Premium', ctaStyle:'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90' },
            ].map(plan => (
              <div key={plan.name} className={`relative rounded-3xl border ${plan.border} ${plan.bg} p-8 flex flex-col`}>
                {(plan as any).badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black text-white ${plan.name === 'Pro' ? 'bg-cyan-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}>
                    {(plan as any).badge}
                  </div>
                )}
                <p className={`text-xs font-black uppercase tracking-widest ${plan.color} mb-2`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
                </div>
                <div className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.color}`} />{f}
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600 line-through">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className={`w-full py-3 rounded-xl text-sm font-black text-center transition ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section id="trust" className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'SECURE.', desc: 'Your data is protected with bank-grade security.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: Lock, title: 'PRIVATE.', desc: "Your privacy is our top priority.", color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: CheckCircle, title: 'RELIABLE.', desc: 'Built for reliability you can trust.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`flex items-center gap-4 rounded-2xl border ${bg} px-5 py-4`}>
                <div className={`w-12 h-12 rounded-2xl ${bg} border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className={`text-sm font-black ${color}`}>{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={32} height={32} className="rounded-xl" />
            <span className="text-lg font-black text-white">moneylix</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5" />
            <span>www.moneylix.in</span>
            <span className="mx-2">·</span>
            <span>🇮🇳 Made for India</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/auth/login" className="hover:text-white transition">Login</Link>
            <Link href="/auth/register" className="hover:text-white transition">Register</Link>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-600">
          © 2026 Moneylix. All rights reserved. · Secured by Razorpay · SSL Encrypted
        </div>
      </footer>

    </div>
  )
}
