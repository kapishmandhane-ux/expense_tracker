import Link from 'next/link';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Smartphone,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="flex h-20 items-center justify-between px-8 sm:px-16 glass-nav border-b border-white/60 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-400 bg-clip-text text-transparent">
            Spendy
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 animate-bounce">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Glassmorphic Personal Finance Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-[1.15]">
          Master Your Wealth with{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-sky-400 to-pink-500 bg-clip-text text-transparent">
            Sub-5-Second
          </span>{' '}
          Precision.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
          Unified cross-platform expense logging and budget analytics. Designed with frosted glass aesthetics, PostgreSQL RLS security, and instant device sync.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <span>Launch Web App</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border border-white/80 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold transition-all shadow-md hover:scale-105"
          >
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-card p-6">
            <div className="specular-line" />
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sub-5s Fast Logging</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Instant mobile keypad and web quick-entry dialogs designed for zero input latency.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="specular-line" />
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dual Glass Theme</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Night Glass and Day Glass with ambient glow mesh canvas and hardware-accelerated blurs.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="specular-line" />
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">PostgreSQL RLS Security</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Strict multi-tenant row-level security ensuring your financial records are 100% private.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 glass-nav border-t border-white/60 dark:border-white/[0.08]">
        © 2026 Spendy / FinTrack Monorepo. Turborepo + Next.js 15 + Expo React Native.
      </footer>
    </div>
  );
}
