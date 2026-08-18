import React from 'react';
import { MetricCard } from '../../../components/metric-card';
import {
  Wallet,
  TrendingDown,
  CreditCard,
  Target,
  ArrowUpRight,
  Plus,
  Utensils,
  ShoppingCart,
  Car,
  Receipt,
  Film,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const recentTransactions = [
    {
      id: '1',
      title: 'Whole Foods Market',
      category: 'Groceries',
      amount: '₹2,450.00',
      time: 'Today, 10:30 AM',
      method: 'UPI',
      icon: ShoppingCart,
      color: '#10b981',
    },
    {
      id: '2',
      title: 'Starbucks Reserve',
      category: 'Food & Dining',
      amount: '₹480.00',
      time: 'Today, 8:15 AM',
      method: 'Credit Card',
      icon: Utensils,
      color: '#f97316',
    },
    {
      id: '3',
      title: 'Uber Premier',
      category: 'Transportation',
      amount: '₹620.00',
      time: 'Yesterday, 9:40 PM',
      method: 'UPI',
      icon: Car,
      color: '#3b82f6',
    },
    {
      id: '4',
      title: 'Electricity & Broadband',
      category: 'Bills & Utilities',
      amount: '₹3,200.00',
      time: 'Aug 17, 2026',
      method: 'Net Banking',
      icon: Receipt,
      color: '#8b5cf6',
    },
    {
      id: '5',
      title: 'IMAX Cinema',
      category: 'Entertainment',
      amount: '₹1,100.00',
      time: 'Aug 16, 2026',
      method: 'Debit Card',
      icon: Film,
      color: '#ec4899',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-account tracking and budget burn telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/expenses"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Spent (Month)"
          amount="₹21,500.00"
          subtitle="↓ 12.4% vs last month"
          icon={<Wallet className="h-5 w-5 text-indigo-500" />}
          trend={{ value: '-12.4%', isPositive: true }}
          accentColor="rgba(99, 102, 241, 0.25)"
        />
        <MetricCard
          title="Monthly Budget Limit"
          amount="₹50,000.00"
          subtitle="43% utilized (21 days left)"
          icon={<Target className="h-5 w-5 text-sky-500" />}
          accentColor="rgba(14, 165, 233, 0.25)"
        />
        <MetricCard
          title="Daily Spending Velocity"
          amount="₹1,131.50"
          subtitle="Target: ₹1,612 / day max"
          icon={<TrendingDown className="h-5 w-5 text-emerald-500" />}
          trend={{ value: 'Under Target', isPositive: true }}
          accentColor="rgba(16, 185, 129, 0.25)"
        />
        <MetricCard
          title="Top Payment Mode"
          amount="UPI (68%)"
          subtitle="₹14,620 across 28 txns"
          icon={<CreditCard className="h-5 w-5 text-purple-500" />}
          accentColor="rgba(139, 92, 246, 0.25)"
        />
      </div>

      {/* Main Grid: Visual Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Budget Bars */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between">
          <div className="specular-line" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Category Spending
              </h2>
              <Link
                href="/budgets"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Food & Dining</span>
                  <span className="text-slate-900 dark:text-white">₹6,850 / ₹12,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: '57%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Groceries</span>
                  <span className="text-slate-900 dark:text-white">₹5,400 / ₹8,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: '67.5%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Transportation</span>
                  <span className="text-slate-900 dark:text-white">₹3,200 / ₹5,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: '64%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Bills & Utilities</span>
                  <span className="text-slate-900 dark:text-white">₹4,200 / ₹6,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: '70%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              💡 Budget tip: Keep daily discretionary spend under ₹850 to hit savings target.
            </p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="specular-line" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              href="/expenses"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
            {recentTransactions.map((tx) => {
              const Icon = tx.icon;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-200/30 dark:hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: tx.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tx.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tx.category} • {tx.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {tx.amount}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {tx.method}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
