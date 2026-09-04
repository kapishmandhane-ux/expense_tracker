'use client';

import React, { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCurrency } from './currency-provider';
import { getDaysRemainingInMonth } from '@repo/utils';
import Link from 'next/link';

export interface AiCopilotCardProps {
  totalSpent: number;
  totalBudget: number;
  categories: Array<{ name: string; spent: number; limit: number; color?: string }>;
  transactionCount: number;
}

export function AiCopilotCard({
  totalSpent,
  totalBudget,
  categories,
  transactionCount,
}: AiCopilotCardProps) {
  const { format } = useCurrency();
  const daysRemaining = getDaysRemainingInMonth();
  const daysPassed = Math.max(1, 30 - daysRemaining);

  const dailyVelocity = totalSpent / daysPassed;
  const projectedMonthEnd = totalSpent + dailyVelocity * daysRemaining;
  const isProjectedOverBudget = totalBudget > 0 && projectedMonthEnd > totalBudget;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Find category with highest burn percentage
  const highestBurnCat = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    const sorted = [...categories].sort((a, b) => {
      const pctA = a.limit > 0 ? (a.spent / a.limit) * 100 : 0;
      const pctB = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
      return pctB - pctA;
    });
    const top = sorted[0];
    return top && top.limit > 0 ? { ...top, pct: Math.round((top.spent / top.limit) * 100) } : null;
  }, [categories]);

  return (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-sky-500/10 space-y-5">
      <div className="specular-line" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spendy AI Copilot
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous spending intelligence, burn forecasts & anomaly detection
            </p>
          </div>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Deep Analytics</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3 Insight Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* 1. Month-End Projection */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span>Month-End Forecast</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {format(projectedMonthEnd)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Based on {format(dailyVelocity)}/day run rate
            </p>
          </div>
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                isProjectedOverBudget
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isProjectedOverBudget
                ? `⚠️ Exceeds budget by ${format(projectedMonthEnd - totalBudget)}`
                : `✓ ${format(totalBudget - projectedMonthEnd)} under budget cap`}
            </span>
          </div>
        </div>

        {/* 2. Category Burn Alert */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Highest Burn Velocity</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white truncate">
              {highestBurnCat ? highestBurnCat.name : 'All Categories Normal'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {highestBurnCat
                ? `${format(highestBurnCat.spent)} of ${format(highestBurnCat.limit)} limit`
                : 'Spend evenly distributed'}
            </p>
          </div>
          <div className="pt-1">
            {highestBurnCat ? (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  highestBurnCat.pct > 90
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {highestBurnCat.pct}% Cap Utilized ({daysRemaining} days left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Safe trajectory
              </span>
            )}
          </div>
        </div>

        {/* 3. AI Savings Opportunity */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Lightbulb className="h-4 w-4 text-sky-500" />
            <span>AI Optimization Tip</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {transactionCount > 10
                ? 'High frequency micro-transactions detected'
                : 'Pacing aligns with conservative spending'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {transactionCount > 10
                ? `Consolidating dining/ride expenses could save an estimated ${format(dailyVelocity * 3)} this cycle.`
                : `Maintaining a daily cap under ${format(Math.max(0, totalBudget - totalSpent) / Math.max(1, daysRemaining))} will protect your savings goal.`}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
