'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet, Receipt, BarChart3, Sparkles, TrendingUp, Brain,
  Shield, Lock, CheckCircle, Globe, ArrowRight, Star, Zap,
  Crown, Check, Menu, X, ChevronRight, Users, Building2,
  PieChart, Banknote, Bell, FileText
} from 'lucide-react'

const stats = [
  { value: '10,000+', label: 'Transactions Tracked' },
  { value: '₹50 Cr+', label: 'Money Managed' },
  { value: '500+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
]

const featureSections = [
  {
    tag: 'Dashboard',
    title: 'Your finances at a glance',
    desc: 'See your total balance, income vs expenses, and cash flow trends — all on one clean dashboard. Know exactly where you stand every day.',
    bullets: ['Real-time balance overview', 'Income vs expense comparison', 'Monthly cash flow chart', 'Multi-business switcher'],
    color: 'emerald',
    visual: (
      <div className="rounded-3xl bg-[#0d1321] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-black text-white">Dashboard</span>
          <span className="text-[10px] text-slate-500">May 2026</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/25 p-4">
            <p className="text-[10px] text-slate-400">Total Balance</p>
            <p className="text-2xl font-black text-white mt-1">₹1,45,230</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ +12.5% vs last month</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-[9px] text-slate-400">Income</p>
              <p className="text-base font-black text-emerald-400">₹2,35,000</p>
            </div>
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
              <p className="text-[9px] text-slate-400">Expenses</p>
              <p className="text-base font-black text-rose-400">₹89,770</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-white/5 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-white font-bold">Cash Flow</span>
              <span className="text-[8px] text-slate-500">This Month</span>
            </div>
            <div className="flex items-end gap-0.5 h-10">
              {[30,45,35,60,45,70,55,80,65,75,90,85].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-sm"
                  style={{height:`${h}%`, background: i >= 9 ? '#10b981' : 'rgba(16,185,129,0.2)'}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Transactions',
    title: 'Every rupee, tracked and categorized',
    desc: 'Log income and expenses in seconds. Filter by date, category, or business. Export to CSV anytime. Never lose track of a payment again.',
    bullets: ['Add transactions in one tap', 'Smart category tagging', 'Filter & search instantly', 'Bulk CSV import/export'],
    color: 'cyan',
    visual: (
      <div className="rounded-3xl bg-[#0d1321] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-black text-white">Transactions</span>
          <span className="text-[10px] text-emerald-400 font-bold">+ Add</span>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            { label: 'Freelance Project', cat: 'Income', amt: '+₹45,000', color: 'text-emerald-400', dot: 'bg-emerald-500' },
            { label: 'Office Supplies', cat: 'Expense', amt: '-₹3,200', color: 'text-rose-400', dot: 'bg-rose-500' },
            { label: 'Client Retainer', cat: 'Income', amt: '+₹30,000', color: 'text-emerald-400', dot: 'bg-emerald-500' },
            { label: 'Marketing Ads', cat: 'Expense', amt: '-₹8,500', color: 'text-rose-400', dot: 'bg-rose-500' },
            { label: 'Consulting Fee', cat: 'Income', amt: '+₹20,000', color: 'text-emerald-400', dot: 'bg-emerald-500' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full ${t.dot} flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-[11px] text-white font-semibold">{t.label}</p>
                <p className="text-[9px] text-slate-500">{t.cat}</p>
              </div>
              <span className={`text-xs font-black ${t.color}`}>{t.amt}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'Receivables',
    title: 'Never forget a pending payment',
    desc: 'Track what clients owe you. Get reminded automatically. Mark as paid when collected. Keep your cash flow healthy without chasing invoices.',
    bullets: ['Track pending client payments', 'Auto reminders by due date', 'Mark paid with one tap', 'Amount visible in app header'],
    color: 'amber',
    visual: (
      <div className="rounded-3xl bg-[#0d1321] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-black text-white">Receivables</span>
          <span className="text-[10px] text-amber-400 font-bold">₹75,000 pending</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { name: 'Rahul Sharma', due: 'Due Jun 1', amt: '₹25,000', status: 'overdue', statusColor: 'text-rose-400 bg-rose-500/10' },
            { name: 'Priya Designs', due: 'Due Jun 8', amt: '₹30,000', status: 'pending', statusColor: 'text-amber-400 bg-amber-500/10' },
            { name: 'StartupXYZ', due: 'Due Jun 15', amt: '₹20,000', status: 'upcoming', statusColor: 'text-slate-400 bg-slate-500/10' },
          ].map((r, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-black text-amber-400">{r.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-white">{r.name}</p>
                <p className="text-[9px] text-slate-500">{r.due}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white">{r.amt}</p>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${r.statusColor}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'AI Advisor',
    title: 'Smart investment advice, powered by AI',
    desc: 'Get personalized investment recommendations based on your income and savings. Gold, SIP, Fixed Deposits — Claude AI helps you decide what is right for you.',
    bullets: ['Powered by Claude (Anthropic)', 'Personalized to your income', 'SIP, Gold, FD recommendations', 'Natural language finance chat'],
    color: 'violet',
    visual: (
      <div className="rounded-3xl bg-[#0d1321] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-black text-white">AI Finance Advisor</span>
          <span className="text-[8px] text-violet-400 font-bold ml-auto bg-violet-500/10 px-2 py-0.5 rounded-full">Claude AI</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] text-slate-400">You asked</p>
            <p className="text-xs text-white mt-1">"I save ₹20,000/month. Where should I invest it?"</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 space-y-2">
            <p className="text-[9px] text-violet-400 font-bold">AI Recommendation</p>
            {[
              { label: 'Nifty Index SIP', pct: '50%', color: 'bg-violet-500' },
              { label: 'Digital Gold', pct: '25%', color: 'bg-amber-500' },
              { label: 'PPF / FD', pct: '25%', color: 'bg-cyan-500' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-slate-300">{r.label}</span>
                  <span className="text-[9px] font-bold text-white">{r.pct}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full">
                  <div className={`h-full ${r.color} rounded-full`} style={{width: r.pct}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#080d18] text-white overflow-x-hidden font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080d18]/95 backdrop-blur-2xl border-b border-white/8 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={34} height={34} className="rounded-xl" />
            <span className="text-lg font-black tracking-tight text-white">moneylix</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm font-black bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/25">
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0d1321] border-t border-white/5 px-6 py-4 space-y-3">
            {[['#features','Features'],['#pricing','Pricing'],['#security','Security']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-slate-300 hover:text-white py-2">
                {label}
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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-[900px] h-[900px] bg-emerald-500/6 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[160px]" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-10 lg:py-0 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-0 items-stretch min-h-screen">

          {/* Left — text */}
          <div className="flex flex-col justify-center space-y-8 relative z-10 lg:py-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold w-fit">
              <Star className="w-3.5 h-3.5" />
              Made for Indian Freelancers &amp; SMBs
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] font-black leading-[0.9] tracking-tight">
              <span className="text-white">Manage your</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">money smarter.</span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-lg">
              Track income, manage expenses, follow up on receivables, and get AI-powered investment advice — all in one beautifully simple app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-base shadow-2xl shadow-emerald-500/25 hover:opacity-90 transition-all active:scale-95">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 bg-white/5 text-white font-bold text-base hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No credit card needed</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> SSL secured</span>
            </div>
          </div>

          {/* Right — Phone fills the column */}
          <div className="relative flex items-center justify-center lg:justify-end lg:pr-0 lg:py-10">
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[420px] h-[420px] bg-emerald-500/8 rounded-full blur-[100px]" />
            </div>

            {/* Phone frame */}
            <div className="relative z-10 w-[340px] lg:w-[380px] xl:w-[420px]">
              <div className="relative w-full" style={{paddingBottom: '210%'}}>
                <div className="absolute inset-0 bg-[#0d1321] rounded-[52px] border-[5px] border-slate-600/70 shadow-[0_80px_160px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-9 bg-[#0d1321] flex items-center justify-center z-10">
                    <div className="w-32 h-7 bg-slate-800 rounded-full" />
                  </div>
                  {/* Status bar */}
                  <div className="absolute top-2 inset-x-0 px-6 flex items-center justify-between z-10">
                    <span className="text-[11px] text-white font-bold">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5 items-end">
                        {[3,5,7,9].map(h => <div key={h} className="w-1 bg-white rounded-sm" style={{height:`${h}px`}} />)}
                      </div>
                      <div className="w-6 h-3 rounded border border-white/40 p-0.5 ml-1">
                        <div className="w-full h-full bg-white rounded-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Screen content */}
                  <div className="absolute top-9 inset-x-0 bottom-16 bg-[#0d1117] px-5 py-4 space-y-4 overflow-hidden">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Dashboard</p>
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/25 p-5">
                      <p className="text-[10px] text-slate-400">Total Balance</p>
                      <p className="text-3xl font-black text-white mt-1 tracking-tight">₹1,45,230</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ +12.5% vs last month</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="text-[9px] text-slate-400">Income</p>
                        <p className="text-base font-black text-emerald-400">₹2,35,000</p>
                      </div>
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
                        <p className="text-[9px] text-slate-400">Expenses</p>
                        <p className="text-base font-black text-rose-400">₹89,770</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-800/60 border border-white/5 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] text-white font-bold">Cash Flow</span>
                        <span className="text-[9px] text-slate-500">May 2026</span>
                      </div>
                      <div className="flex items-end gap-0.5 h-16">
                        {[30,45,35,60,45,70,55,80,65,75,90,85].map((h,i) => (
                          <div key={i} className="flex-1 rounded-t-sm"
                            style={{height:`${h}%`, background: i >= 9 ? '#10b981' : 'rgba(16,185,129,0.2)'}} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-800/60 border border-white/5 p-4">
                      <p className="text-[10px] text-white font-bold mb-3">By Category</p>
                      <div className="space-y-2.5">
                        {[
                          {name:'Office Supplies', pct:40, color:'bg-cyan-500'},
                          {name:'Marketing', pct:27, color:'bg-violet-500'},
                          {name:'Travel', pct:20, color:'bg-amber-500'},
                        ].map(c => (
                          <div key={c.name} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${c.color} flex-shrink-0`} />
                            <span className="text-[9px] text-slate-400 flex-1">{c.name}</span>
                            <div className="w-20 h-1.5 bg-slate-700 rounded-full">
                              <div className={`h-full ${c.color} rounded-full`} style={{width:`${c.pct}%`}} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Bottom nav */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-[#0d1321] border-t border-white/5 flex items-center justify-around px-4">
                    {['Home','Txns','Overall','AI','More'].map((l, i) => (
                      <div key={l} className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-lg ${i===0 ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                        <span className={`text-[8px] font-bold ${i===0 ? 'text-emerald-400' : 'text-slate-600'}`}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stat badges — tucked inside the phone width */}
              <div className="absolute right-0 top-16 translate-x-1/3 bg-[#131c2e]/95 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl w-40 z-20">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Monthly Growth</p>
                <p className="text-emerald-400 font-black text-2xl mt-1">+12.5%</p>
                <div className="flex items-end gap-0.5 h-6 mt-2">
                  {[3,5,4,7,6,8,10].map((h,i) => (
                    <div key={i} className="flex-1 bg-emerald-500 rounded-sm opacity-70" style={{height:`${h*2}px`}} />
                  ))}
                </div>
              </div>

              <div className="absolute left-0 bottom-36 -translate-x-1/3 bg-[#131c2e]/95 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl w-44 z-20">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Net Profit</p>
                <p className="text-cyan-400 font-black text-xl mt-1">₹1,45,230</p>
                <p className="text-[9px] text-emerald-400 font-semibold mt-1">↑ Positive cash flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-14 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black text-white">{value}</p>
              <p className="text-sm text-slate-500 font-semibold mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SECTIONS (alternating) ── */}
      <section id="features" className="py-4">
        {featureSections.map((feat, i) => {
          const colorMap: Record<string, { tag: string; bullet: string; border: string; bg: string }> = {
            emerald: { tag: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', bullet: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
            cyan:    { tag: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',           bullet: 'text-cyan-400',    border: 'border-cyan-500/20',    bg: 'bg-cyan-500/5' },
            amber:   { tag: 'text-amber-400 bg-amber-500/10 border-amber-500/20',        bullet: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/5' },
            violet:  { tag: 'text-violet-400 bg-violet-500/10 border-violet-500/20',     bullet: 'text-violet-400',  border: 'border-violet-500/20',  bg: 'bg-violet-500/5' },
          }
          const c = colorMap[feat.color]
          const isEven = i % 2 === 1

          return (
            <div key={i} className={`py-28 px-6 lg:px-10 ${i % 2 === 1 ? 'bg-white/[0.015]' : ''} border-b border-white/5`}>
              <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}
                style={isEven ? {direction: 'rtl'} : {}}>

                {/* Text */}
                <div className="space-y-7" style={{direction:'ltr'}}>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${c.tag}`}>
                    {feat.tag}
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
                    {feat.title}
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                    {feat.desc}
                  </p>
                  <ul className="space-y-3">
                    {feat.bullets.map(b => (
                      <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${c.bullet}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register"
                    className={`inline-flex items-center gap-2 text-sm font-bold ${c.bullet} hover:opacity-80 transition`}>
                    Try it free <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Visual */}
                <div style={{direction:'ltr'}}>
                  {feat.visual}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Start free. Upgrade when ready.</h2>
            <p className="text-slate-400 mt-4 text-lg">No hidden fees. Cancel anytime.</p>
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
      <section id="security" className="py-20 px-6 lg:px-10 border-t border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4">Trust & Security</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your data is safe with us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield,       title: 'Bank-grade Security',  desc: 'SSL encryption and secure password hashing protect every byte of your financial data.',                color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
              { icon: Lock,         title: 'Your Data, Private',   desc: 'We never sell or share your financial information. Your data belongs to you, always.',              color: 'text-cyan-400',    bg: 'bg-cyan-500/8',    border: 'border-cyan-500/20' },
              { icon: CheckCircle,  title: '99.9% Uptime',         desc: 'Built for reliability on enterprise infrastructure. Your data is always available when you need it.', color: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`rounded-3xl border ${border} ${bg} p-8 space-y-4`}>
                <div className={`w-14 h-14 rounded-2xl ${bg} border ${border} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <p className={`text-base font-black ${color}`}>{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 lg:px-10 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-8">
          <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={64} height={64} className="mx-auto rounded-3xl" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Take control of your<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">financial future.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-xl mx-auto">
            Join freelancers and business owners who use Moneylix to track, save, and grow.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-lg shadow-2xl shadow-emerald-500/25 hover:opacity-90 transition-all active:scale-95">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-600">No credit card required · Free plan forever available · 🇮🇳 Made for India</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/moneylix-mark.svg" alt="Moneylix" width={32} height={32} className="rounded-xl" />
            <span className="text-base font-black text-white">moneylix</span>
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
