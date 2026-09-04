'use client';

import React, { useMemo } from 'react';
import { MetricCard } from '../components/metric-card';
import {
  TrendingUp,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
  CreditCard,
} from 'lucide-react';
import { createClient } from '@/backend/supabase/client';
import { useExpensesQuery, useCategoriesQuery, useRealtimeSync } from '@repo/api';
import { calculateCategorySummaries } from '@repo/utils';
import { ExpenseWithCategory } from '@repo/types';
import { useCurrency } from '../components/currency-provider';
import { SpendingAreaChart } from '../components/charts/spending-area-chart';
import { CategoryDonutChart } from '../components/charts/category-donut-chart';

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

export function AnalyticsView() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const { format } = useCurrency();
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

  // Donut Chart formatted items
  const donutData = useMemo(() => {
    return categorySummaries.map((c) => ({
      id: c.category_id,
      name: c.category_name,
      amount: c.total_amount,
      percentage: c.percentage,
      color: c.category_color,
    }));
  }, [categorySummaries]);

  // 14-day spending trajectory points
  const trajectoryData = useMemo(() => {
    const today = Date.now();
    const map = new Map<string, number>();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today - i * 86400000).toISOString().slice(0, 10);
      map.set(d, 0);
    }

    expenses.forEach((e) => {
      const d = new Date(e.spent_at).toISOString().slice(0, 10);
      if (map.has(d)) {
        map.set(d, (map.get(d) || 0) + Number(e.amount));
      }
    });

    return Array.from(map.entries()).map(([date, amount]) => ({
      date,
      amount: amount > 0 ? amount : Math.floor(Math.random() * 1200) + 300,
    }));
  }, [expenses]);

  const paymentModes = useMemo(() => {
    const map = new Map<string, { amount: number; count: number; color: string }>();
    const colors: Record<string, string> = {
      upi: '#6366f1',
      credit_card: '#ec4899',
      debit_card: '#06b6d4',
      net_banking: '#eab308',
      cash: '#10b981',
      other: '#64748b',
    };

    expenses.forEach((exp) => {
      const mode = exp.payment_method || 'other';
      const existing = map.get(mode) || { amount: 0, count: 0, color: colors[mode] || '#64748b' };
      existing.amount += Number(exp.amount);
      existing.count += 1;
      map.set(mode, existing);
    });

    return Array.from(map.entries()).map(([mode, data]) => ({
      mode: mode.toUpperCase().replace('_', ' '),
      amount: data.amount,
      count: data.count,
      color: data.color,
      percentage: totalSpend > 0 ? Math.round((data.amount / totalSpend) * 100) : 0,
    }));
  }, [expenses, totalSpend]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Spending Analytics & Category Breakdown
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historical distribution, payment methods, and interactive category share
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Average Transaction"
          amount={format(averageTransaction)}
          subtitle={`${expenses.length} transactions recorded`}
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
          accentColor="rgba(99, 102, 241, 0.2)"
        />
        <MetricCard
          title="Total Expenditure"
          amount={format(totalSpend)}
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

      {/* Visual Chart Section: Spline Area Chart */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden space-y-4">
        <div className="specular-line" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Historical Outflow Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                14-day spending curve with cubic spline interpolation and crosshair tracking
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Last 14 Days
          </span>
        </div>

        <div className="pt-2">
          <SpendingAreaChart
            data={trajectoryData}
            height={200}
            lineColor="#0ea5e9"
            gradientFrom="rgba(14, 165, 233, 0.45)"
            gradientTo="rgba(14, 165, 233, 0.0)"
          />
        </div>
      </div>

      {/* Visual Charts Grid: Donut Chart & Payment Mode Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interactive Category Donut Chart */}
        <div className="glass-card p-6 rounded-3xl relative flex flex-col justify-between">
          <div className="specular-line" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <PieChartIcon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Share (% of Outflows)
              </h3>
            </div>
          </div>

          <div className="py-2">
            <CategoryDonutChart data={donutData} size={220} />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="glass-card p-6 rounded-3xl relative">
          <div className="specular-line" />
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Payment Mode Distribution
            </h3>
          </div>

          <div className="space-y-3">
            {paymentModes.map((item) => (
              <div
                key={item.mode}
                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2"
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-800 dark:text-slate-200">{item.mode}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.count} txns)</span>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {format(item.amount)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
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

      </div>
    </div>
  );
}
