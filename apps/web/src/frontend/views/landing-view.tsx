'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Lock,
  Smartphone,
  ScanLine,
  CheckCircle2,
  Zap,
  Bell,
  Flame,
  Check,
} from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';

export function LandingView() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR'>('USD');
  const [monthlySpend, setMonthlySpend] = useState<number>(3500);
  const [savingTargetPercent, setSavingTargetPercent] = useState<number>(15);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  const currencyMultiplier = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 83.5;

  const currentDisplaySpend = Math.round(monthlySpend * currencyMultiplier);
  const monthlySavings = Math.round((currentDisplaySpend * savingTargetPercent) / 100);
  const sixMonthSavings = monthlySavings * 6;
  const oneYearSavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-[#010209] text-slate-100 selection:bg-brand-blue/30 relative overflow-x-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="glow-orb-primary -top-40 -left-40 animate-pulse-slow" />
      <div className="glow-orb-cyan top-1/3 -right-40 animate-pulse-slow" />
      <div className="glow-orb-primary -bottom-40 left-1/3 animate-pulse-slow" />

      {/* ========================================================================= */}
      {/* 1. STICKY GLASS NAVIGATION BAR                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-[#010209]/75 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0560E6] via-[#7943C6] to-[#00F0FF] p-[1px] shadow-lg shadow-brand-blue/25 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#0E1326] rounded-[11px] flex items-center justify-center">
                <Wallet className="h-5 w-5 text-brand-cyan" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-cyan bg-clip-text text-transparent">
                SpendFlow
              </span>
              <span className="text-[10px] font-mono tracking-widest text-brand-violet uppercase font-semibold">
                FinTrack OS
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0E1326]/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/[0.08]">
            <a href="#features" className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-all">
              Features
            </a>
            <a href="#analytics" className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-all">
              Live HUD
            </a>
            <a href="#calculator" className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-all">
              Savings Calc
            </a>
            <a href="#security" className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-all">
              Security
            </a>
          </nav>

          {/* Actions & Currency Switcher */}
          <div className="flex items-center gap-3">
            {/* Currency Pill */}
            <div className="hidden sm:flex items-center bg-[#0E1326]/80 rounded-xl p-1 border border-white/[0.08] text-xs font-mono">
              {(['USD', 'EUR', 'INR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === curr
                      ? 'bg-brand-blue text-white font-bold shadow-sm shadow-brand-blue/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <ThemeToggle />

            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="relative inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0560E6] to-[#7943C6] hover:from-[#066aff] hover:to-[#8a52db] text-white text-xs font-bold tracking-wide shadow-lg shadow-brand-blue/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Start Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION & 3D FLOATING GLASS HUD PREVIEW                           */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1326]/80 backdrop-blur-xl border border-white/[0.12] text-brand-cyan text-xs font-medium mb-8 shadow-inner shadow-brand-cyan/10">
          <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
          <span className="font-mono text-[11px] tracking-wide uppercase text-slate-300">
            Precision Personal Finance Engine
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-ping" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1]">
          Master Your Outflow with{' '}
          <span className="bg-gradient-to-r from-brand-cyan via-[#0560E6] to-brand-violet bg-clip-text text-transparent">
            Intelligent Precision.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl font-normal leading-relaxed">
          Automated cross-platform tracking, predictive burn rates, and glassmorphic financial intelligence designed for sub-5-second speed and zero data compromise.
        </p>

        {/* CTAs & Trust Markers */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0560E6] via-[#0560E6] to-[#7943C6] hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-brand-blue/35 transition-all hover:scale-105 active:scale-95"
          >
            <span>Launch Web App</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0E1326]/80 hover:bg-[#0E1326] backdrop-blur-2xl border border-white/[0.12] hover:border-white/25 text-white font-semibold text-sm transition-all shadow-lg hover:scale-105"
          >
            <Smartphone className="h-4 w-4 text-brand-violet" />
            <span>Create Free Account</span>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-emerald" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand-cyan" /> Sub-5s logging
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-brand-violet" /> 100% PostgreSQL RLS
          </span>
        </div>

        {/* ======================================================================= */}
        {/* HERO DASHBOARD GLASS HUD (Interactive Mock Stack)                       */}
        {/* ======================================================================= */}
        <div id="analytics" className="relative mt-16 w-full max-w-5xl group">
          {/* Outer Specular Lighting Frame */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/20 via-white/[0.05] to-brand-blue/20 shadow-2xl shadow-black/80">
            <div className="glass-panel p-6 sm:p-8 relative overflow-hidden text-left">
              <div className="specular-line" />

              {/* HUD Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-brand-crimson/80" />
                  <div className="h-3 w-3 rounded-full bg-brand-amber/80" />
                  <div className="h-3 w-3 rounded-full bg-brand-emerald/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">spendy://hud.live-session</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] font-mono text-brand-emerald">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse" />
                    LIVE SYNC ACTIVE
                  </span>
                </div>
              </div>

              {/* Top Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {/* Metric 1: Net Outflow */}
                <div className="p-5 rounded-2xl bg-[#010209]/60 border border-white/[0.06] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Net Monthly Spend</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-full">
                      <TrendingDown className="h-3 w-3" /> -12.4%
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {currencySymbol}3,420.50
                    </span>
                    <span className="text-xs font-mono text-slate-500">{currency}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Target cap: {currencySymbol}4,500.00
                  </div>
                </div>

                {/* Metric 2: Burn Pacing */}
                <div className="p-5 rounded-2xl bg-[#010209]/60 border border-white/[0.06] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Live Budget Pacing</span>
                    <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full font-bold">
                      68% USED
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      10 Days
                    </span>
                    <span className="text-xs text-slate-400 font-medium">remaining in cycle</span>
                  </div>
                  {/* Progress Meter Bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue w-[68%]" />
                  </div>
                </div>

                {/* Metric 3: Top Category */}
                <div className="p-5 rounded-2xl bg-[#010209]/60 border border-white/[0.06] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Highest Outflow Velocity</span>
                    <span className="text-[11px] font-mono text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded-full font-bold">
                      FOOD & DINING
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {currencySymbol}1,162.90
                    </span>
                    <span className="text-xs font-mono text-brand-violet font-semibold">34%</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Average: {currencySymbol}38.70 / day
                  </div>
                </div>
              </div>

              {/* Main Interactive Wave Chart & Category Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* 2/3 Column: Daily Burn Velocity Spline Curve */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-[#010209]/60 border border-white/[0.06] relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">Daily Burn Rate vs Target Threshold</h4>
                      <p className="text-xs text-slate-500">Aug 1 – Aug 21, 2026</p>
                    </div>
                    <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-lg">
                      Safe Velocity
                    </span>
                  </div>

                  {/* High-tech SVG Spline Area Chart */}
                  <div className="relative h-48 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0560E6" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#0560E6" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00F0FF" />
                          <stop offset="50%" stopColor="#0560E6" />
                          <stop offset="100%" stopColor="#7943C6" />
                        </linearGradient>
                      </defs>

                      {/* Threshold Guide Line */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255, 75, 110, 0.3)" strokeDasharray="4 4" strokeWidth="1.5" />
                      <text x="430" y="44" fill="#FF4B6E" fontSize="9" fontFamily="monospace">CAP LIMIT</text>

                      {/* Area Fill */}
                      <path
                        d="M 0 140 Q 60 80, 120 110 T 240 65 T 360 90 T 480 35 L 500 40 L 500 180 L 0 180 Z"
                        fill="url(#glowGradient)"
                      />

                      {/* Dynamic Stroke Line */}
                      <path
                        d="M 0 140 Q 60 80, 120 110 T 240 65 T 360 90 T 480 35 L 500 40"
                        fill="none"
                        stroke="url(#strokeGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Dots with glow */}
                      <circle cx="120" cy="110" r="4.5" fill="#00F0FF" className="animate-pulse" />
                      <circle cx="240" cy="65" r="4.5" fill="#0560E6" />
                      <circle cx="360" cy="90" r="4.5" fill="#7943C6" />
                      <circle cx="480" cy="35" r="5.5" fill="#00F0FF" className="animate-ping" />
                      <circle cx="480" cy="35" r="5" fill="#00F0FF" />
                    </svg>

                    {/* Interactive Tooltip Overlay */}
                    <div className="absolute top-4 right-12 bg-[#0E1326] border border-white/20 px-3 py-1.5 rounded-xl shadow-xl shadow-brand-blue/20 text-left">
                      <p className="text-[10px] text-slate-400 font-mono">Today, 2:45 PM</p>
                      <p className="text-xs font-bold text-white">Apple Store • {currencySymbol}129.00</p>
                    </div>
                  </div>
                </div>

                {/* 1/3 Column: Category Rings & Recent Tag */}
                <div className="p-5 rounded-2xl bg-[#010209]/60 border border-white/[0.06] flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide mb-3">Category Allocation</h4>
                    <div className="space-y-2.5">
                      {[
                        { name: 'Food & Dining', pct: 34, color: 'bg-brand-blue', amount: '$1,162' },
                        { name: 'Housing & Utilities', pct: 28, color: 'bg-brand-violet', amount: '$957' },
                        { name: 'Subscriptions', pct: 14, color: 'bg-brand-cyan', amount: '$478' },
                        { name: 'Transit & Fuel', pct: 12, color: 'bg-brand-amber', amount: '$410' },
                        { name: 'Shopping & Misc', pct: 12, color: 'bg-brand-crimson', amount: '$410' },
                      ].map((cat) => (
                        <div key={cat.name} className="flex flex-col gap-1 text-xs">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-slate-300">{cat.name}</span>
                            <span className="font-mono text-slate-400">{cat.pct}% ({cat.amount})</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Tracked</span>
                    <span className="font-mono font-bold text-brand-cyan">{currencySymbol}3,420.50</span>
                  </div>
                </div>
              </div>

              {/* Floating HUD Micro-Badges */}
              <div className="hidden sm:grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="text-brand-amber">⚡</span>
                  <span className="text-slate-300 truncate">
                    <strong className="text-white">Recurring Alert:</strong> Netflix renewal tomorrow ({currencySymbol}15.99)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="text-brand-emerald">🎯</span>
                  <span className="text-slate-300 truncate">
                    <strong className="text-white">Budget Win:</strong> Dining spend is 18% under cap
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="text-brand-cyan">✨</span>
                  <span className="text-slate-300 truncate">
                    <strong className="text-white">Smart Tag:</strong> Whole Foods categorized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PARTNERS & INTEGRATIONS TICKER                                         */}
      {/* ========================================================================= */}
      <section className="py-10 border-y border-white/[0.06] bg-[#0E1326]/40 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-mono tracking-widest text-slate-500 uppercase mb-6 font-semibold">
            Seamlessly Ingesting Transactions Across Global Gateways & Banks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
            {['Plaid', 'Stripe', 'Apple Pay', 'Google Pay', 'Unified Payments Interface (UPI)', 'Monzo', 'Revolut', 'Visa / Mastercard'].map(
              (partner) => (
                <div key={partner} className="flex items-center gap-2 font-mono text-sm font-semibold text-slate-300 tracking-wider">
                  <div className="h-2 w-2 rounded-full bg-brand-cyan/80" />
                  {partner}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURE DEEP-DIVES (Interactive Glass Bento Grid)                      */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-xs font-mono font-semibold uppercase mb-4">
            Next-Gen Fintech Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Extreme Frictionless Velocity
          </h2>
          <p className="mt-4 text-base text-slate-400">
            No more waiting for bloated banking apps. Spendy empowers you with sub-second logging and autonomous financial surveillance.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: AI OCR Receipt Scanning */}
          <div className="glass-card p-8 flex flex-col justify-between group hover:border-brand-cyan/40 hover:shadow-neon-cyan/20">
            <div className="specular-line" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-6 shadow-lg shadow-brand-cyan/10">
                <ScanLine className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">OCR Receipt Ingestion</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Snap physical receipts on mobile or drag invoices on web. Our edge parser auto-extracts merchant, tax breakdown, and items in &lt; 800ms.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[#010209]/80 border border-white/[0.08] font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Receipt OCR</span>
                <span className="text-brand-emerald">CONFIDENCE 99.4%</span>
              </div>
              <div className="flex justify-between text-white font-bold">
                <span>Blue Bottle Coffee</span>
                <span>{currencySymbol}6.75</span>
              </div>
              <div className="text-[11px] text-brand-cyan">Auto-tagged: Food & Dining</div>
            </div>
          </div>

          {/* Feature 2: Subscription Watchdog & Ghost Spend Killer */}
          <div className="glass-card p-8 flex flex-col justify-between group hover:border-brand-violet/40 hover:shadow-neon-violet/20">
            <div className="specular-line" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center text-brand-violet mb-6 shadow-lg shadow-brand-violet/10">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ghost Spend Watchdog</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Detect stealth trial renewals, price hikes, and duplicate subscriptions (Netflix, AWS, gym memberships) before they bill your card.
              </p>
            </div>

            <div className="mt-8 space-y-2">
              {[
                { name: 'ChatGPT Plus', price: '$20.00', renewal: 'In 3 days', active: true },
                { name: 'Gym Membership', price: '$65.00', renewal: 'Tomorrow', active: true },
              ].map((sub) => (
                <div key={sub.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#010209]/80 border border-white/[0.08] text-xs">
                  <div>
                    <p className="font-semibold text-white">{sub.name}</p>
                    <p className="text-[10px] text-brand-amber font-mono">{sub.renewal}</p>
                  </div>
                  <span className="font-mono font-bold text-white">{sub.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Budget Envelope Pacing Radar */}
          <div className="glass-card p-8 flex flex-col justify-between group hover:border-brand-blue/40 hover:shadow-neon-blue/20">
            <div className="specular-line" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-6 shadow-lg shadow-brand-blue/10">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Predictive Burn Radar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dynamic 3-stage threshold pacing. Get real-time daily allowable spend calculations so you never cross your target monthly budget cap.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[#010209]/80 border border-white/[0.08] space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Envelope</span>
                <span className="font-mono font-bold text-brand-emerald">72% SAFE PACE</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-emerald via-brand-cyan to-brand-blue w-[72%]" />
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Remaining daily allowance: <strong className="text-white">{currencySymbol}45.20 / day</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE SAVINGS & WEALTH CALCULATOR                                 */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="specular-line" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-brand-cyan uppercase font-bold tracking-wider">
              Interactive Wealth Forecaster
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              How Much Could You Save in 12 Months?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Adjust your monthly spending and target optimization rate to view projected wealth preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders Control Box */}
            <div className="space-y-6 bg-[#010209]/60 p-6 rounded-2xl border border-white/[0.06]">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Average Monthly Spend</span>
                  <span className="text-white font-bold text-sm">
                    {currencySymbol}{currentDisplaySpend.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="250"
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>{currencySymbol}1,000</span>
                  <span>{currencySymbol}15,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Target Budget Trim Rate</span>
                  <span className="text-brand-cyan font-bold text-sm">{savingTargetPercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={savingTargetPercent}
                  onChange={(e) => setSavingTargetPercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>5% (Gentle)</span>
                  <span>35% (Aggressive)</span>
                </div>
              </div>
            </div>

            {/* Projected Wealth Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0E1326] to-[#010209] border border-white/[0.1] text-center">
                <span className="text-xs text-slate-400 font-medium">6-Month Wealth Banked</span>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-cyan mt-2">
                  {currencySymbol}{sixMonthSavings.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500 font-mono block mt-1">
                  +{currencySymbol}{monthlySavings}/mo
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0560E6]/20 to-[#010209] border border-brand-blue/30 text-center shadow-lg shadow-brand-blue/20">
                <span className="text-xs text-slate-300 font-medium">1-Year Preserved Total</span>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-2">
                  {currencySymbol}{oneYearSavings.toLocaleString()}
                </p>
                <span className="text-[11px] text-brand-emerald font-mono block mt-1">
                  Compound Retained
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ZERO-KNOWLEDGE PRIVACY & SECURITY MATRIX                               */}
      {/* ========================================================================= */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono font-semibold uppercase mb-4">
              Zero Data Monetization
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Financial Privacy is Non-Negotiable
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Traditional expense apps sell your transaction data to advertisers. Spendy is built on an ironclad zero-knowledge architecture with PostgreSQL Row Level Security.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: 'PostgreSQL 16+ Engine RLS', desc: 'Queries are gated strictly at database kernel level (auth.uid() = user_id).' },
                { title: 'Hardware Biometrics & SecureStore', desc: 'Tokens encrypted via FaceID/Fingerprint hardware keystore.' },
                { title: 'TLS 1.3 & Zero-Plaintext Storage', desc: 'All data encrypted in transit and at rest with AES-256.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-lg bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center text-brand-emerald shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 relative">
            <div className="specular-line" />
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-slate-400">PostgreSQL Policy</span>
                <span className="text-brand-emerald">ENFORCED (100%)</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#010209] text-brand-cyan overflow-x-auto text-[11px] leading-relaxed border border-white/[0.06]">
{`CREATE POLICY "Tenant Isolation"
ON public.expenses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`}
              </pre>
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                <span>Verification Hash</span>
                <span className="text-slate-400">SHA-256 (0x8F9C...4B6E)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SOCIAL PROOF & KEY PERFORMANCE METRICS                                 */}
      {/* ========================================================================= */}
      <section className="py-16 border-t border-white/[0.06] bg-[#0E1326]/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center font-mono">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-cyan">$4.2M+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Tracked & Optimized</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">&lt; 4.0s</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Avg Entry Speed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-emerald">99.98%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Sync SLA Uptime</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-violet">4.9 / 5</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Cross-Platform Rating</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL HIGH-CONVERSION CTA BANNER                                       */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="glass-panel p-10 sm:p-16 relative overflow-hidden border border-brand-blue/30 shadow-2xl shadow-brand-blue/20">
          <div className="specular-line" />
          <div className="glow-orb-primary -top-40 left-1/4" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Take Complete Control of Every Dollar Today.
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
            Join users worldwide who have streamlined their personal finances with zero friction.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0560E6] to-[#7943C6] hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-brand-blue/40 transition-all hover:scale-105"
            >
              <span>Launch Web App Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] text-white font-semibold text-sm transition-all hover:scale-105"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FUTURISTIC MULTI-COLUMN FOOTER                                         */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/[0.08] bg-[#010209] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center text-white">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white">SpendFlow / FinTrack</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#analytics" className="hover:text-white transition-colors">HUD</a>
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-brand-emerald">
            <span className="h-2 w-2 rounded-full bg-brand-emerald animate-pulse" />
            All Systems Operational
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-slate-600 font-mono">
          © 2026 SpendFlow / FinTrack. Monorepo engineered with Next.js 15 App Router, Expo React Native & Supabase PostgreSQL.
        </div>
      </footer>
    </div>
  );
}
