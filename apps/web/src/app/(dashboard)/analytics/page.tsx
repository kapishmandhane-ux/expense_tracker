'use client';

import React from 'react';
import { MetricCard } from '../../../components/metric-card';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  const categoryBreakdown = [
    { name: 'Food & Dining', amount: 6850, percentage: 31.8, color: '#f97316' },
    { name: 'Groceries', amount: 5400, percentage: 25.1, color: '#10b981' },
    { name: 'Bills & Utilities', amount: 4200, percentage: 19.5, color: '#8b5cf6' },
    { name: 'Transportation', amount: 3200, percentage: 14.8, color: '#3b82f6' },
    { name: 'Entertainment', amount: 1100, percentage: 5.1, color: '#ec4899' },
    { name: 'Others', amount: 750, percentage: 3.7, color: '#64748b' },
  ];

  const paymentModes = [
    { mode: 'UPI (GPay / PhonePe)', percentage: 65, amount: 13975, color: '#6366f1' },
    { mode: 'Credit Card', percentage: 22, amount: 4730, color: '#0ea5e9' },
    { mode: 'Debit Card', percentage: 8, amount: 1720, color: '#ec4899' },
    { mode: 'Cash', percentage: 5, amount: 1075, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Spending Analytics & Trends
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep behavioral insights, category distribution, and payment velocity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Average Transaction"
          amount="₹488.60"
          subtitle="44 transactions this cycle"
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
          accentColor="rgba(99, 102, 241, 0.2)"
        />
        <MetricCard
          title="Discretionary vs Fixed"
          amount="38% / 62%"
          subtitle="Healthy financial distribution"
          icon={<Layers className="h-5 w-5 text-sky-500" />}
          accentColor="rgba(14, 165, 233, 0.2)"
        />
        <MetricCard
          title="Savings Velocity"
          amount="+ ₹14,200"
          subtitle="Projected month-end surplus"
          icon={<ArrowUpRight className="h-5 w-5 text-emerald-500" />}
          accentColor="rgba(16, 185, 129, 0.2)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <div className="specular-line" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Category Share (% of Total Spend)
          </h3>
          <div className="space-y-3.5">
            {categoryBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white">
                    ₹{item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="glass-card p-6">
          <div className="specular-line" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Payment Mode Distribution
          </h3>
          <div className="space-y-4">
            {paymentModes.map((item) => (
              <div key={item.mode} className="p-3 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-white/60 dark:border-white/5">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-800 dark:text-slate-200">{item.mode}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₹{item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
