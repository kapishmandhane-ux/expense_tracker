'use client';

import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Plus, Flame, Clock } from 'lucide-react';

interface CategoryBudget {
  id: string;
  category: string;
  color: string;
  limit: number;
  spent: number;
}

const INITIAL_BUDGETS: CategoryBudget[] = [
  { id: '1', category: 'Food & Dining', color: '#f97316', limit: 12000, spent: 6850 },
  { id: '2', category: 'Groceries', color: '#10b981', limit: 8000, spent: 5400 },
  { id: '3', category: 'Transportation', color: '#3b82f6', limit: 5000, spent: 3200 },
  { id: '4', category: 'Bills & Utilities', color: '#8b5cf6', limit: 6000, spent: 4200 },
  { id: '5', category: 'Shopping', color: '#eab308', limit: 10000, spent: 9800 },
  { id: '6', category: 'Entertainment', color: '#ec4899', limit: 4000, spent: 1100 },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = ((totalSpent / totalLimit) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Budget Management & Burn Rate
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Category thresholds, velocity warnings, and daily spend projections
          </p>
        </div>
      </div>

      {/* Global Burn Banner */}
      <div className="glass-card p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10">
        <div className="specular-line" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              August 2026 Monthly Cap
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              ₹{totalSpent.toLocaleString()} / ₹{totalLimit.toLocaleString()}
            </h2>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              On Track ({overallPercentage}%)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              ₹{(totalLimit - totalSpent).toLocaleString()} remaining across all categories
            </p>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const remaining = Math.max(0, b.limit - b.spent);
          const isWarning = pct >= 75 && pct < 95;
          const isExceeded = pct >= 95;
          const dailyBurn = (remaining / 21).toFixed(0);

          return (
            <div key={b.id} className="glass-card p-5 relative">
              <div className="specular-line" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: b.color }}
                  />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {b.category}
                  </h3>
                </div>

                {isExceeded ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Critical
                  </span>
                ) : isWarning ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Warning
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Healthy
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Spent: ₹{b.spent.toLocaleString()}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Cap: ₹{b.limit.toLocaleString()}</span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isExceeded ? '#f43f5e' : isWarning ? '#f59e0b' : b.color,
                  }}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Allowable / Day:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  ₹{dailyBurn}/day
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
