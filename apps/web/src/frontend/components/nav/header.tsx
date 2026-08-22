'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import { Bell, Plus, Wallet } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 glass-nav border-b border-white/60 dark:border-white/[0.08]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-400 bg-clip-text text-transparent">
            Spendy
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
            PRO
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          <span>Quick Expense</span>
        </Link>

        <button
          className="p-2.5 rounded-xl bg-white/40 dark:bg-white/[0.06] backdrop-blur-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <ThemeToggle />

        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm">
          <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
            KM
          </div>
        </div>
      </div>
    </header>
  );
}
