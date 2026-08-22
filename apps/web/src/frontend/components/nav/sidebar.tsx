'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  Settings,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: ReceiptText },
  { label: 'Budgets', href: '/budgets', icon: Target },
  { label: 'Analytics', href: '/analytics', icon: PieChart },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/60 dark:border-white/[0.08] glass-nav flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Budget Burn Widget in Sidebar */}
        <div className="glass-card p-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              August Budget
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">42%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full"
              style={{ width: '42%' }}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-2 font-medium">
            ₹28,500 left of ₹50,000 limit
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-200/40 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 flex items-center justify-between">
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Mobile Sync</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected (Expo)
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-400" />
      </div>
    </aside>
  );
}
