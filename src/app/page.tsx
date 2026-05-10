'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet, Receipt, BarChart3, Sparkles, TrendingUp, Brain,
  Shield, Lock, CheckCircle, Globe, ChevronLeft, ChevronRight,
  ArrowRight, Star, Zap, Crown, Check, Menu, X
} from 'lucide-react'

const features = [
  {
    icon: Wallet,
    title: 'Track Income',
    desc: 'Track all your income in one place. Every credit, every source — always visible in real time.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-500/20',
    stat: '₹2,35,000',
    statLabel: 'Income tracked this month',
  },
  {
    icon: Receipt,
    title: 'Manage Expenses',
    desc: 'Categorize and manage expenses easily. Know exactly where every rupee goes.',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    glow: 'shadow-rose-500/20',
    stat: '₹89,770',
    statLabel: 'Expenses categorized',
  },
  {
    icon: BarChart3,
    title: 'Smart Insights',
    desc: 'Get AI-powered insights to save more. Understand your spending patterns instantly.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-500/20',
    stat: '+12.5%',
    statLabel: 'Monthly growth rate',
  },
  {
    icon: TrendingUp,
    title: 'Business Analytics',
    desc: 'Understand your business performance deeply with multi-business reports in one view.',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/20',
    stat: '₹1,45,230',
    statLabel: 'Net profit tracked',
  },
  {
    icon: Brain,
    title: 'AI Finance Tools',
    desc: 'Smart investment recommendations powered by Claude AI — gold, SIP, and fixed deposit advice.',
    color: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    glow: 'shadow-violet-500/20',
    stat: 'Claude AI',
    statLabel: 'Powered by Anthropic',
  },
]

export default function LandingPage() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const go = (idx: number) => {
    setFading(true)
    setTimeout(() => { setCurrent(idx); setFading(false) }, 250)
  }

  const next = () => go((current + 1) % features.length)
  const prev = () => go((current - 1 + features.length) % features.length)

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current])

  const feat = features[current]

  return (
    <div className="min-h-screen bg-[#080d18] text-white overflow-x-hidden font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#080d18]/95 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-18 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={38} height={38} className="rounded-2xl" />
            <span className="text-xl font-black tracking-tight text-white">moneylix</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#security" className="hover:text-emerald-400 transition-colors">Security</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-bold text-slate-300 hover:text-white px-5 py-2.5 rounded-xl hover:bg-white/8 transition-all">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm font-black bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/25">
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0d1321] border-t border-white/5 px-6 py-4 space-y-3">
            {['#features', '#pricing', '#security'].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-slate-300 hover:text-white py-2 capitalize">
                {['Features', 'Pricing', 'Security'][i]}
              </a>
            ))}
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-300 py-2">Sign In</Link>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)}
              className="block text-sm font-black bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 px-6 py-3 rounded-xl text-center">
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6 lg:px-10 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] bg-emerald-500/6 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left */}
          <div className="space-y-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Image src="/logos/moneylix-mark.svg" alt="M" width={48} height={48} className="rounded-2xl" />
              <span className="text-2xl font-black tracking-tight text-emerald-400">moneylix</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black leading-[0.95] tracking-tight">
                <span className="text-white block">SMART</span>
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">FINANCE</span>
                <span className="text-white block">MANAGEMENT</span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
              Track <span className="text-emerald-400 font-bold">income</span>, manage{' '}
              <span className="text-emerald-400 font-bold">expenses</span> &amp; grow your money smarter.
            </p>

            {/* Audience */}
            <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20">
                <Star className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium">
                For <span className="text-emerald-400 font-bold">freelancers</span>,{' '}
                <span className="text-emerald-400 font-bold">creators</span> &amp;{' '}
                <span className="text-emerald-400 font-bold">small businesses</span> in India
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-base shadow-2xl shadow-emerald-500/30 hover:opacity-90 transition-all active:scale-95">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-white/15 bg-white/5 text-white font-bold text-base hover:bg-white/10 hover:border-white/25 transition-all">
                Sign In
              </Link>
            </div>

            {/* Footer tag */}
            <p className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Globe className="w-3.5 h-3.5" /> www.moneylix.in &nbsp;·&nbsp; 🇮🇳 Made for India
            </p>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Phone */}
              <div className="relative w-[290px] h-[600px] bg-[#0d1321] rounded-[48px] border-[5px] border-slate-700/80 shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-9 bg-[#0d1321] flex items-center justify-center z-10">
                  <div className="w-28 h-6 bg-slate-800 rounded-full" />
                </div>
                <div className="absolute top-9 inset-x-0 px-5 flex items-center justify-between">
                  <span className="text-[11px] text-white font-bold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5 items-end">
                      {[3,5,7,9].map(h => <div key={h} className="w-1 bg-white rounded-sm" style={{height:`${h}px`}} />)}
                    </div>
                    <div className="w-6 h-3 rounded border border-white/40 p-0.5">
                      <div className="w-full h-full bg-white rounded-sm" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-16 inset-x-0 bottom-14 bg-[#0d1117] px-4 py-3 overflow-hidden space-y-3">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Overview</p>

                  {/* Balance */}
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/25 p-4">
                    <p className="text-[10px] text-slate-400">Total Balance</p>
                    <p className="text-2xl font-black text-white mt-1 tracking-tight">₹1,45,230</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">+12.5% vs last month</p>
                  </div>

                  {/* Bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'Income', value: '₹2,35,000', pct: '80%', color: 'bg-emerald-500' },
                      { label: 'Expenses', value: '₹89,770', pct: '38%', color: 'bg-rose-500' },
                    ].map(b => (
                      <div key={b.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-slate-400">{b.label}</span>
                          <span className={`text-[9px] font-bold ${b.color === 'bg-emerald-500' ? 'text-emerald-400' : 'text-rose-400'}`}>{b.value}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full">
                          <div className={`h-full ${b.color} rounded-full`} style={{width:b.pct}} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="rounded-xl bg-slate-800/60 border border-white/5 p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-white font-bold">Cash Flow</span>
                      <span className="text-[8px] text-slate-500">This Month</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-14">
                      {[30,45,35,60,45,70,55,80,65,75,90,85].map((h,i) => (
                        <div key={i} className="flex-1 rounded-t-sm transition-all"
                          style={{height:`${h}%`, background: i >= 9 ? '#10b981' : 'rgba(16,185,129,0.2)'}} />
                      ))}
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/15 px-2 py-0.5 rounded-full">+₹45,230</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="rounded-xl bg-slate-800/60 border border-white/5 p-3">
                    <p className="text-[10px] text-white font-bold mb-2.5">Expenses by Category</p>
                    <div className="space-y-2">
                      {[
                        {name:'Office Supplies', pct:40, color:'bg-cyan-500', val:'₹32,450'},
                        {name:'Marketing', pct:27, color:'bg-violet-500', val:'₹21,300'},
                        {name:'Travel', pct:20, color:'bg-amber-500', val:'₹15,860'},
                      ].map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${c.color} flex-shrink-0`} />
                          <span className="text-[8px] text-slate-400 flex-1">{c.name}</span>
                          <span className="text-[8px] text-white font-mono">{c.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="absolute bottom-0 inset-x-0 h-14 bg-[#0d1321] border-t border-white/5 flex items-center justify-around px-3">
                  {['Overview','Transactions','Reports','More'].map((l, i) => (
                    <div key={l} className="flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-lg ${i===0 ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                      <span className={`text-[7px] font-bold ${i===0 ? 'text-emerald-400' : 'text-slate-600'}`}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -right-20 top-14 bg-[#131c2e]/95 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl w-40">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Monthly Growth</p>
                <p className="text-emerald-400 font-black text-2xl mt-1">+12.5%</p>
                <div className="flex items-end gap-0.5 h-6 mt-2">
                  {[3,5,4,7,6,8,10].map((h,i) => (
                    <div key={i} className="flex-1 bg-emerald-500 rounded-sm opacity-70" style={{height:`${h*2.2}px`}} />
                  ))}
                </div>
              </div>

              <div className="absolute -left-20 bottom-32 bg-[#131c2e]/95 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl w-44">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Income vs Expenses</p>
                <p className="text-emerald-400 font-black text-lg mt-1">+₹1,45,230</p>
                <div className="flex gap-0.5 items-end mt-2">
                  {[2,4,3,6,5,7,8].map((h,i) => (
                    <div key={i} className="flex-1 bg-cyan-500/60 rounded-sm" style={{height:`${h*3}px`}} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SLIDER ── */}
      <section id="features" className="py-32 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4">What we offer</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">Everything you need</h2>
            <p className="text-slate-400 mt-5 text-lg max-w-xl mx-auto">One platform. All your finances. Built for India.</p>
          </div>

          {/* Slide content */}
          <div className={`transition-all duration-300 ${fading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[420px]">

              {/* Left */}
              <div className="space-y-8">
                <div className={`inline-flex w-20 h-20 rounded-3xl ${feat.bg} border ${feat.border} items-center justify-center shadow-2xl ${feat.glow}`}>
                  <feat.icon className={`w-10 h-10 ${feat.color}`} />
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    Feature {current + 1} of {features.length}
                  </p>
                  <h3 className="text-5xl font-black text-white leading-tight">{feat.title}</h3>
                  <p className="text-xl text-slate-400 leading-relaxed max-w-md">{feat.desc}</p>
                </div>
                <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl ${feat.bg} border ${feat.border}`}>
                  <span className={`text-3xl font-black font-mono ${feat.color}`}>{feat.stat}</span>
                  <span className="text-sm text-slate-400 font-medium">{feat.statLabel}</span>
                </div>
              </div>

              {/* Right — Visual card */}
              <div className={`relative rounded-3xl ${feat.bg} border ${feat.border} p-14 flex flex-col items-center justify-center min-h-[360px] overflow-hidden shadow-2xl ${feat.glow}`}>
                <div className="absolute inset-0 opacity-30">
                  <div className={`absolute top-8 right-8 w-32 h-32 ${feat.bg} rounded-full blur-2xl`} />
                  <div className={`absolute bottom-8 left-8 w-24 h-24 ${feat.bg} rounded-full blur-xl`} />
                </div>
                <div className={`relative w-28 h-28 rounded-[32px] ${feat.bg} border ${feat.border} flex items-center justify-center mb-6`}>
                  <feat.icon className={`w-14 h-14 ${feat.color}`} />
                </div>
                <p className={`text-5xl font-black font-mono ${feat.color} relative`}>{feat.stat}</p>
                <p className="text-slate-400 font-medium mt-3 relative text-lg">{feat.statLabel}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <button onClick={prev}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>

            <div className="flex items-center gap-3">
              {features.map((f, i) => (
                <button key={i} onClick={() => go(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? `w-10 h-3 ${feat.bg.replace('/10','').replace('bg-','bg-').replace('500','400')} border ${feat.border}`
                      : 'w-3 h-3 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button onClick={next}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* Feature tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-12">
            {features.map((f, i) => (
              <button key={i} onClick={() => go(i)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  i === current
                    ? `${f.bg} ${f.border} shadow-lg`
                    : 'bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10'
                }`}>
                <f.icon className={`w-5 h-5 ${i === current ? f.color : 'text-slate-500'}`} />
                <span className={`text-[11px] font-bold ${i === current ? 'text-white' : 'text-slate-500'}`}>{f.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-32 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4">Simple pricing</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">Start free,<br />upgrade when ready</h2>
            <p className="text-slate-400 mt-5 text-lg">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free', price: '₹0', period: 'forever',
                icon: Zap, color: 'text-slate-300', border: 'border-white/10', bg: 'bg-white/3',
                features: ['1 Business', 'Basic Dashboard', 'Transactions', 'Calculator'],
                locked: ['Reports', 'Receivables', 'AI Advisor'],
                cta: 'Get Started Free', ctaStyle: 'bg-slate-700/80 text-white hover:bg-slate-700 border border-white/10',
              },
              {
                name: 'Pro', price: '₹199', period: '/month',
                icon: Crown, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5',
                badge: 'POPULAR', badgeBg: 'bg-cyan-500',
                features: ['3 Businesses', 'Full Transactions', 'Reports & Analytics', 'Receivables', 'Export CSV', 'Edit Categories'],
                locked: ['AI Advisor'],
                cta: 'Get Pro', ctaStyle: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30',
                note: 'Annual: ₹1,788 — Save ₹600',
              },
              {
                name: 'Premium', price: '₹499', period: '/month',
                icon: Sparkles, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5',
                badge: 'BEST VALUE', badgeBg: 'bg-gradient-to-r from-amber-500 to-rose-500',
                features: ['Unlimited Businesses', 'All Pro Features', 'AI Investment Advisor', 'Export CSV & JSON', 'Priority Support'],
                locked: [],
                cta: 'Get Premium', ctaStyle: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90 shadow-lg shadow-amber-500/30',
                note: 'Annual: ₹3,588 — Save ₹2,400',
              },
            ].map((plan: any) => (
              <div key={plan.name}
                className={`relative rounded-3xl border ${plan.border} ${plan.bg} p-8 flex flex-col gap-6 hover:-translate-y-1 transition-transform duration-300`}>
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${plan.badgeBg}`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-11 h-11 rounded-2xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                    <plan.icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <p className={`text-sm font-black uppercase tracking-widest ${plan.color}`}>{plan.name}</p>
                </div>

                <div>
                  <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 text-base mb-2">{plan.period}</span>
                  </div>
                  {plan.note && <p className="text-xs text-emerald-400 font-semibold mt-1.5">{plan.note}</p>}
                </div>

                <div className="flex-1 space-y-3">
                  {plan.features.map((f: string) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-slate-200">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.color}`} />{f}
                    </div>
                  ))}
                  {plan.locked.map((f: string) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-slate-600 line-through">
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>

                <Link href="/auth/register"
                  className={`w-full py-3.5 rounded-xl text-sm font-black text-center transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="py-24 px-6 lg:px-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4">Why trust us</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Built with security first</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'SECURE', desc: 'Your data is protected with bank-grade security and SSL encryption.', color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
              { icon: Lock, title: 'PRIVATE', desc: 'Your financial data is never sold or shared. Your privacy is our top priority.', color: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/20' },
              { icon: CheckCircle, title: 'RELIABLE', desc: 'Built for reliability with 99.9% uptime. Your data is always available when you need it.', color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`rounded-3xl border ${border} ${bg} p-8 text-center space-y-5`}>
                <div className={`w-16 h-16 rounded-3xl ${bg} border ${border} flex items-center justify-center mx-auto`}>
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
                <p className={`text-base font-black uppercase tracking-widest ${color}`}>{title}.</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 lg:px-10 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-8">
          <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={72} height={72} className="mx-auto rounded-3xl" />
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Ready to take control<br />of your finances?
          </h2>
          <p className="text-xl text-slate-400 max-w-xl mx-auto">
            Join thousands of freelancers and business owners who use Moneylix to track, save, and grow.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-lg shadow-2xl shadow-emerald-500/30 hover:opacity-90 transition-all active:scale-95">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-600">No credit card required · Free plan forever available</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={36} height={36} className="rounded-2xl" />
            <span className="text-lg font-black text-white">moneylix</span>
          </Link>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Globe className="w-4 h-4" /> www.moneylix.in &nbsp;·&nbsp; 🇮🇳 Made for India
          </p>
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/auth/login" className="hover:text-white transition">Login</Link>
            <Link href="/auth/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Moneylix. All rights reserved.</p>
          <p className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> Secured by Razorpay · SSL Encrypted</p>
        </div>
      </footer>

    </div>
  )
}
