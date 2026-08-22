'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Plus, Flame, Clock, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency, getDaysRemainingInMonth, getCurrentMonthKey } from '@repo/utils';
import { createClient } from '@/backend/supabase/client';
import { useBudgetsQuery, useBudgetMutations, useExpensesQuery, useRealtimeSync } from '@repo/api';

interface CategoryBudget {
  id: string;
  category_id: string;
  category: string;
  color: string;
  limit: number;
  spent: number;
}

const PRESET_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining', color: '#f97316' },
  { id: 'cat-2', name: 'Groceries', color: '#10b981' },
  { id: 'cat-3', name: 'Transportation', color: '#3b82f6' },
  { id: 'cat-4', name: 'Bills & Utilities', color: '#8b5cf6' },
  { id: 'cat-5', name: 'Shopping', color: '#eab308' },
  { id: 'cat-6', name: 'Entertainment', color: '#ec4899' },
  { id: 'cat-7', name: 'Health & Fitness', color: '#06b6d4' },
  { id: 'cat-8', name: 'Others', color: '#64748b' },
];

const INITIAL_BUDGETS: CategoryBudget[] = [
  { id: 'b-1', category_id: 'cat-1', category: 'Food & Dining', color: '#f97316', limit: 12000, spent: 6850 },
  { id: 'b-2', category_id: 'cat-2', category: 'Groceries', color: '#10b981', limit: 8000, spent: 5400 },
  { id: 'b-3', category_id: 'cat-3', category: 'Transportation', color: '#3b82f6', limit: 5000, spent: 3200 },
  { id: 'b-4', category_id: 'cat-4', category: 'Bills & Utilities', color: '#8b5cf6', limit: 6000, spent: 4200 },
  { id: 'b-5', category_id: 'cat-5', category: 'Shopping', color: '#eab308', limit: 10000, spent: 9800 },
  { id: 'b-6', category_id: 'cat-6', category: 'Entertainment', color: '#ec4899', limit: 4000, spent: 1100 },
];

export function BudgetsView() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const currentMonthKey = getCurrentMonthKey();
  const { data: dbBudgets } = useBudgetsQuery(supabase, currentMonthKey);
  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { setBudget, deleteBudget } = useBudgetMutations(supabase);

  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('cat-1');
  const [limitInput, setLimitInput] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const daysRemaining = getDaysRemainingInMonth();

  const budgets = useMemo(() => {
    if (dbBudgets && dbBudgets.length > 0 && dbExpenses) {
      return dbBudgets.map((b) => {
        const cat = PRESET_CATEGORIES.find((c) => c.id === b.category_id) || {
          id: b.category_id,
          name: 'Category',
          color: '#64748b',
        };
        const spent = dbExpenses
          .filter((exp) => exp.category_id === b.category_id)
          .reduce((sum, e) => sum + Number(e.amount), 0);

        return {
          id: b.id,
          category_id: b.category_id,
          category: cat.name,
          color: cat.color,
          limit: Number(b.monthly_limit),
          spent,
        };
      });
    }
    return localBudgets;
  }, [dbBudgets, dbExpenses, localBudgets]);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0';

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitInput || isNaN(Number(limitInput))) return;

    const numLimit = parseFloat(limitInput);
    const cat = PRESET_CATEGORIES.find((c) => c.id === selectedCatId) || PRESET_CATEGORIES[0];

    if (editingBudgetId) {
      setLocalBudgets((prev) =>
        prev.map((b) =>
          b.id === editingBudgetId
            ? { ...b, category_id: cat.id, category: cat.name, color: cat.color, limit: numLimit }
            : b
        )
      );
    } else {
      const existing = localBudgets.find((b) => b.category_id === cat.id);
      if (existing) {
        setLocalBudgets((prev) =>
          prev.map((b) => (b.category_id === cat.id ? { ...b, limit: numLimit } : b))
        );
      } else {
        setLocalBudgets((prev) => [
          ...prev,
          {
            id: 'b-' + Date.now(),
            category_id: cat.id,
            category: cat.name,
            color: cat.color,
            limit: numLimit,
            spent: 0,
          },
        ]);
      }
    }

    setBudget.mutate({
      category_id: cat.id,
      monthly_limit: numLimit,
      month: currentMonthKey,
    });

    setIsModalOpen(false);
    setLimitInput('');
    setEditingBudgetId(null);
  };

  const handleDelete = (id: string) => {
    setLocalBudgets((prev) => prev.filter((b) => b.id !== id));
    deleteBudget.mutate(id);
  };

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

        <button
          onClick={() => {
            setEditingBudgetId(null);
            setLimitInput('');
            setSelectedCatId('cat-1');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Global Burn Banner */}
      <div className="glass-card p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10">
        <div className="specular-line" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Monthly Budget Cap
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalSpent)} / {formatCurrency(totalLimit)}
            </h2>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                Number(overallPercentage) > 95
                  ? 'bg-rose-500/15 text-rose-500'
                  : Number(overallPercentage) > 75
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {Number(overallPercentage) > 95 ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              {Number(overallPercentage) > 95
                ? 'Over Budget'
                : Number(overallPercentage) > 75
                ? 'Approaching Limit'
                : 'On Track'}{' '}
              ({overallPercentage}%)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {formatCurrency(Math.max(0, totalLimit - totalSpent))} remaining across all categories
            </p>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              Number(overallPercentage) > 95
                ? 'bg-rose-500'
                : Number(overallPercentage) > 75
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Number(overallPercentage))}%` }}
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
          const dailyBurn = remaining > 0 ? (remaining / daysRemaining).toFixed(0) : '0';

          return (
            <div key={b.id} className="glass-card p-5 relative group">
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

                <div className="flex items-center gap-1.5">
                  {isExceeded ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Critical
                    </span>
                  ) : isWarning ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 flex items-center gap-1">
                      <Flame className="h-3 w-3" /> 75%+ Used
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                      Safe
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setEditingBudgetId(b.id);
                      setSelectedCatId(b.category_id);
                      setLimitInput(b.limit.toString());
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(b.spent)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  of {formatCurrency(b.limit)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-white/5 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {daysRemaining} days left
                </span>
                <span>
                  Allowable:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {formatCurrency(Number(dailyBurn))}/day
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set/Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {editingBudgetId ? 'Edit Budget Cap' : 'Set Category Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 10000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full text-2xl font-bold px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
