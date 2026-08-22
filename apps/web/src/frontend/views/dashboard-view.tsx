'use client';

import React, { useMemo } from 'react';
import { MetricCard } from '../components/metric-card';
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
  Activity,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatExpenseDate, getDaysRemainingInMonth } from '@repo/utils';
import { createClient } from '@/backend/supabase/client';
import { useExpensesQuery, useBudgetsQuery, useRealtimeSync } from '@repo/api';
import { ExpenseWithCategory } from '@repo/types';

const CATEGORY_ICON_MAP: Record<string, any> = {
  'Food & Dining': Utensils,
  'Groceries': ShoppingCart,
  'Transportation': Car,
  'Bills & Utilities': Receipt,
  'Entertainment': Film,
  'Shopping': ShoppingBag,
  'Health & Fitness': Activity,
};

const FALLBACK_EXPENSES: ExpenseWithCategory[] = [
  {
    id: '1',
    user_id: 'demo',
    category_id: 'cat-2',
    amount: 2450,
    payment_method: 'upi',
    spent_at: new Date().toISOString(),
    note: 'Whole Foods Market',
    receipt_storage_path: null,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-2', user_id: 'demo', name: 'Groceries', color: '#10b981', icon: 'shopping-cart', is_system: true, created_at: '' },
  },
  {
    id: '2',
    user_id: 'demo',
    category_id: 'cat-1',
    amount: 480,
    payment_method: 'credit_card',
    spent_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    note: 'Starbucks Reserve',
    receipt_storage_path: null,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-1', user_id: 'demo', name: 'Food & Dining', color: '#f97316', icon: 'utensils', is_system: true, created_at: '' },
  },
  {
    id: '3',
    user_id: 'demo',
    category_id: 'cat-3',
    amount: 620,
    payment_method: 'upi',
    spent_at: new Date(Date.now() - 86400000).toISOString(),
    note: 'Uber Premier Ride',
    receipt_storage_path: null,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-3', user_id: 'demo', name: 'Transportation', color: '#3b82f6', icon: 'car', is_system: true, created_at: '' },
  },
  {
    id: '4',
    user_id: 'demo',
    category_id: 'cat-4',
    amount: 3200,
    payment_method: 'net_banking',
    spent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'Electricity & Broadband',
    receipt_storage_path: null,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-4', user_id: 'demo', name: 'Bills & Utilities', color: '#8b5cf6', icon: 'receipt', is_system: true, created_at: '' },
  },
  {
    id: '5',
    user_id: 'demo',
    category_id: 'cat-5',
    amount: 1100,
    payment_method: 'debit_card',
    spent_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    note: 'IMAX Cinema',
    receipt_storage_path: null,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-5', user_id: 'demo', name: 'Entertainment', color: '#ec4899', icon: 'film', is_system: true, created_at: '' },
  },
];

export function DashboardView() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbBudgets } = useBudgetsQuery(supabase);

  const expenses = dbExpenses && dbExpenses.length > 0 ? dbExpenses : FALLBACK_EXPENSES;
  const recentTransactions = expenses.slice(0, 5);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [expenses]);

  const totalBudgetLimit = useMemo(() => {
    if (dbBudgets && dbBudgets.length > 0) {
      return dbBudgets.reduce((sum, item) => sum + Number(item.monthly_limit), 0);
    }
    return 45000;
  }, [dbBudgets]);

  const daysRemaining = getDaysRemainingInMonth();
  const dailySpendingVelocity = (totalSpent / Math.max(1, 30 - daysRemaining)).toFixed(0);

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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Spent"
          amount={formatCurrency(totalSpent)}
          subtitle="Real-time transaction total"
          icon={<Wallet className="h-5 w-5 text-indigo-500" />}
          accentColor="rgba(99, 102, 241, 0.25)"
        />
        <MetricCard
          title="Monthly Budget Limit"
          amount={formatCurrency(totalBudgetLimit)}
          subtitle={`${daysRemaining} days left in cycle`}
          icon={<Target className="h-5 w-5 text-sky-500" />}
          accentColor="rgba(14, 165, 233, 0.25)"
        />
        <MetricCard
          title="Daily Spending Velocity"
          amount={formatCurrency(Number(dailySpendingVelocity))}
          subtitle={`Avg spend per day`}
          icon={<TrendingDown className="h-5 w-5 text-emerald-500" />}
          accentColor="rgba(16, 185, 129, 0.25)"
        />
        <MetricCard
          title="Total Transactions"
          amount={`${expenses.length} Records`}
          subtitle="Logged across all accounts"
          icon={<CreditCard className="h-5 w-5 text-purple-500" />}
          accentColor="rgba(139, 92, 246, 0.25)"
        />
      </div>

      {/* Main Grid: Visual Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Budget Quick Bars */}
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
              {[
                { name: 'Food & Dining', spent: 6850, limit: 12000, color: '#f97316' },
                { name: 'Groceries', spent: 5400, limit: 8000, color: '#10b981' },
                { name: 'Transportation', spent: 3200, limit: 5000, color: '#3b82f6' },
                { name: 'Bills & Utilities', spent: 4200, limit: 6000, color: '#8b5cf6' },
              ].map((item) => {
                const pct = Math.min(100, Math.round((item.spent / item.limit) * 100));
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 mt-6">
            <Link
              href="/analytics"
              className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-white font-semibold flex items-center justify-between"
            >
              <span>Explore Analytics Deep-Dive</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="specular-line" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <Link
              href="/expenses"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/5">
            {recentTransactions.map((tx) => {
              const catName = tx.category?.name || 'Others';
              const catColor = tx.category?.color || '#64748b';
              const Icon = CATEGORY_ICON_MAP[catName] || Tag;

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: `${catColor}15`,
                        color: catColor,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {tx.note || catName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatExpenseDate(tx.spent_at)} •{' '}
                        <span className="uppercase text-[10px] font-semibold tracking-wider">
                          {tx.payment_method.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
