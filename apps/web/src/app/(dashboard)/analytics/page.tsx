'use client';

import React, { useMemo } from 'react';
import { MetricCard } from '../../../components/metric-card';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { useExpensesQuery, useCategoriesQuery, useRealtimeSync } from '@repo/api';
import { calculateCategorySummaries, formatCurrency } from '@repo/utils';
import { ExpenseWithCategory } from '@repo/types';

const PRESET_CATEGORIES = [
  { id: 'cat-1', user_id: 'user-demo', name: 'Food & Dining', color: '#f97316', icon: 'utensils', is_system: true, created_at: '' },
  { id: 'cat-2', user_id: 'user-demo', name: 'Groceries', color: '#10b981', icon: 'shopping-cart', is_system: true, created_at: '' },
  { id: 'cat-3', user_id: 'user-demo', name: 'Transportation', color: '#3b82f6', icon: 'car', is_system: true, created_at: '' },
  { id: 'cat-4', user_id: 'user-demo', name: 'Bills & Utilities', color: '#8b5cf6', icon: 'receipt', is_system: true, created_at: '' },
  { id: 'cat-5', user_id: 'user-demo', name: 'Entertainment', color: '#ec4899', icon: 'film', is_system: true, created_at: '' },
  { id: 'cat-6', user_id: 'user-demo', name: 'Shopping', color: '#eab308', icon: 'shopping-bag', is_system: true, created_at: '' },
  { id: 'cat-7', user_id: 'user-demo', name: 'Health & Fitness', color: '#06b6d4', icon: 'activity', is_system: true, created_at: '' },
  { id: 'cat-8', user_id: 'user-demo', name: 'Others', color: '#64748b', icon: 'more-horizontal', is_system: true, created_at: '' },
];

const FALLBACK_EXPENSES: ExpenseWithCategory[] = [
  { id: '1', user_id: 'demo', category_id: 'cat-2', amount: 2450, payment_method: 'upi', spent_at: '2026-08-19', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
  { id: '2', user_id: 'demo', category_id: 'cat-1', amount: 480, payment_method: 'credit_card', spent_at: '2026-08-19', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
  { id: '3', user_id: 'demo', category_id: 'cat-3', amount: 620, payment_method: 'upi', spent_at: '2026-08-18', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
  { id: '4', user_id: 'demo', category_id: 'cat-4', amount: 3200, payment_method: 'net_banking', spent_at: '2026-08-17', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
  { id: '5', user_id: 'demo', category_id: 'cat-5', amount: 1100, payment_method: 'debit_card', spent_at: '2026-08-16', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
  { id: '6', user_id: 'demo', category_id: 'cat-6', amount: 6500, payment_method: 'credit_card', spent_at: '2026-08-15', note: '', receipt_storage_path: null, created_at: '', updated_at: '' },
];

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbCategories } = useCategoriesQuery(supabase);

  const expenses = dbExpenses && dbExpenses.length > 0 ? dbExpenses : FALLBACK_EXPENSES;
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : PRESET_CATEGORIES;

  const categorySummaries = useMemo(() => {
    return calculateCategorySummaries(expenses, categories);
  }, [expenses, categories]);

  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const averageTransaction = useMemo(() => {
    return expenses.length > 0 ? totalSpend / expenses.length : 0;
  }, [expenses, totalSpend]);

  const paymentModes = useMemo(() => {
    const map = new Map<string, { amount: number; count: number; color: string }>();
    const colors: Record<string, string> = {
      upi: '#6366f1',
      credit_card: '#0ea5e9',
      debit_card: '#ec4899',
      net_banking: '#8b5cf6',
      cash: '#10b981',
      other: '#64748b',
    };

    expenses.forEach((exp) => {
      const mode = exp.payment_method || 'upi';
      const cur = map.get(mode) || { amount: 0, count: 0, color: colors[mode] || '#64748b' };
      cur.amount += Number(exp.amount);
      cur.count += 1;
      map.set(mode, cur);
    });

    const res: Array<{ mode: string; percentage: number; amount: number; color: string }> = [];
    map.forEach((val, key) => {
      res.push({
        mode: key.toUpperCase().replace('_', ' '),
        percentage: totalSpend > 0 ? Math.round((val.amount / totalSpend) * 100) : 0,
        amount: val.amount,
        color: val.color,
      });
    });

    return res.sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpend]);

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
          amount={formatCurrency(averageTransaction)}
          subtitle={`${expenses.length} transactions recorded`}
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
          accentColor="rgba(99, 102, 241, 0.2)"
        />
        <MetricCard
          title="Total Expenditure"
          amount={formatCurrency(totalSpend)}
          subtitle="All recorded historical entries"
          icon={<Layers className="h-5 w-5 text-sky-500" />}
          accentColor="rgba(14, 165, 233, 0.2)"
        />
        <MetricCard
          title="Top Spending Category"
          amount={categorySummaries[0]?.category_name || 'None'}
          subtitle={categorySummaries[0] ? `${categorySummaries[0].percentage}% of total spend` : 'No data'}
          icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
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
            {categorySummaries.map((item) => (
              <div key={item.category_id}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.category_color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{item.category_name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(item.total_amount)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.category_color,
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
              <div
                key={item.mode}
                className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-white/60 dark:border-white/5"
              >
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-800 dark:text-slate-200">{item.mode}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(item.amount)} ({item.percentage}%)
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
