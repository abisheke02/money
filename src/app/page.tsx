import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp, TrendingDown, Wallet, Sparkles, BarChart3,
  Receipt, Tags, Globe, ClipboardList, Calculator, ChevronRight,
  Check, Shield, Zap, Crown, Star, ArrowRight, Menu
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logos/moneylix-horizontal-dark.svg" alt="Moneylix" width={160} height={40} />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#about" className="hover:text-white transition">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition px-4 py-2 rounded-xl hover:bg-white/5">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Now with AI Investment Advisor
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
            Your Money,<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fully in Control
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Moneylix is the smart finance dashboard for freelancers and small businesses in India.
            Track income, expenses, receivables — and get AI-powered investment advice.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-lg shadow-2xl shadow-emerald-500/30 hover:opacity-90 transition active:scale-95">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition backdrop-blur">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Secured with SSL</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Free plan available</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" /> Powered by Claude AI</span>
          </div>

          {/* Dashboard preview */}
          <div className="relative mt-12 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur p-4 shadow-2xl shadow-black/50 max-w-4xl mx-auto">
            <div className="rounded-[20px] bg-slate-900 overflow-hidden border border-white/5 p-6">
              {/* Mock dashboard */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Balance', value: '₹2,45,800', icon: Wallet, color: 'text-white', bg: 'from-white/10 to-white/5' },
                  { label: 'Monthly Income', value: '₹48,500', icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-white/5' },
                  { label: 'Monthly Expense', value: '₹31,200', icon: TrendingDown, color: 'text-rose-400', bg: 'from-rose-500/15 to-white/5' },
                  { label: 'Savings Rate', value: '35%', icon: BarChart3, color: 'text-cyan-400', bg: 'from-cyan-500/15 to-white/5' },
                ].map(card => (
                  <div key={card.label} className={`rounded-2xl border border-white/8 bg-gradient-to-br ${card.bg} p-4`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{card.label}</p>
                    <p className={`text-lg font-black font-mono ${card.color}`}>{card.value}</p>
                    <card.icon className={`w-4 h-4 mt-2 ${card.color} opacity-60`} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-[2] rounded-2xl border border-white/8 bg-white/5 p-4 h-28 flex items-center justify-center">
                  <div className="space-y-1.5 w-full">
                    {[80, 60, 90, 45, 70, 55, 85].map((h, i) => (
                      <div key={i} className="flex gap-0.5">
                        <div className="bg-emerald-500/60 rounded-sm" style={{ width: `${h}%`, height: '6px' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/5 p-4 h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white">35%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-emerald-500/20 blur-xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Built for Indian<br />freelancers & businesses</h2>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">One dashboard to track all your money — income, expenses, receivables, and investments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Receipt, title: 'Transaction Tracking', desc: 'Log every income and expense in seconds. Filter, search, and export your full transaction history.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: ClipboardList, title: 'Receivables & Payables', desc: 'Track pending payments from clients. Get reminders when payments are overdue. Mark received with one click.', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: Sparkles, title: 'AI Investment Advisor', desc: 'Get personalised investment advice powered by Claude AI — gold, SIP, fixed deposits — based on your finances.', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: Globe, title: 'Multi-Business Support', desc: 'Manage finances for multiple businesses from one account. Switch between businesses instantly.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: BarChart3, title: 'Reports & Analytics', desc: 'Daily, weekly, and monthly reports. Pie charts, cashflow graphs, and category breakdown — all real-time.', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
              { icon: Tags, title: 'Custom Categories', desc: 'Create your own income and expense categories with colors and icons to match your business workflow.', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`rounded-3xl border ${bg} p-7 hover:-translate-y-1 transition-transform duration-300`}>
                <div className={`w-11 h-11 rounded-2xl ${bg} border flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-3">Simple pricing</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Start free, upgrade when ready</h2>
            <p className="text-slate-400 mt-4 text-lg">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '₹0', period: 'forever', icon: Zap,
                color: 'text-slate-400', border: 'border-white/10', bg: 'bg-white/5',
                features: ['1 Business', 'Transactions', 'Basic Dashboard', 'Calculator'],
                locked: ['Reports', 'Receivables', 'AI Advisor'],
                cta: 'Get Started Free', ctaStyle: 'bg-slate-700 text-white hover:bg-slate-600',
              },
              {
                name: 'Pro', price: '₹199', period: '/month', icon: Crown,
                color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5',
                badge: 'POPULAR',
                features: ['3 Businesses', 'Full Transactions', 'Reports & Analytics', 'Receivables', 'Export CSV', 'Edit Categories'],
                locked: ['AI Advisor'],
                cta: 'Get Pro', ctaStyle: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
              },
              {
                name: 'Premium', price: '₹499', period: '/month', icon: Sparkles,
                color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5',
                badge: 'BEST VALUE',
                features: ['Unlimited Businesses', 'Everything in Pro', 'AI Investment Advisor', 'Export CSV & JSON', 'Priority Support'],
                locked: [],
                cta: 'Get Premium', ctaStyle: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90',
              },
            ].map(plan => (
              <div key={plan.name} className={`relative rounded-3xl border ${plan.border} ${plan.bg} p-8 flex flex-col`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${plan.name === 'Pro' ? 'bg-cyan-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}>
                    {plan.badge}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-2xl ${plan.bg} border ${plan.border} flex items-center justify-center mb-4`}>
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <p className={`text-sm font-black uppercase tracking-widest ${plan.color} mb-2`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
                </div>
                {plan.name !== 'Free' && <p className="text-[10px] text-slate-500 mb-6">Annual plan available — save up to 40%</p>}
                {plan.name === 'Free' && <div className="mb-6" />}
                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${plan.color}`} />
                      {f}
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="w-3.5 h-3.5 flex-shrink-0 rounded-full border border-slate-700" />
                      <span className="line-through">{f}</span>
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

      {/* ── About / CTA ────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 mx-auto">
            <Image src="/logos/moneylix-app-icon-dark.svg" alt="Moneylix" width={56} height={56} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Ready to take control<br />of your finances?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join thousands of freelancers and business owners who use Moneylix to track their money, get paid faster, and invest smarter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-lg shadow-2xl shadow-emerald-500/20 hover:opacity-90 transition">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-xs text-slate-600 font-medium">No credit card required · Free plan forever available</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <Image src="/logos/moneylix-horizontal-dark.svg" alt="Moneylix" width={140} height={35} />
              <p className="text-xs text-slate-500 max-w-xs">Smart finance management for freelancers and small businesses in India.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link href="/auth/login" className="hover:text-white transition">Login</Link>
              <Link href="/auth/register" className="hover:text-white transition">Register</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© 2026 Moneylix. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Secured by Razorpay · SSL Encrypted</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
