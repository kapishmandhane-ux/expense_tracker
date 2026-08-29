'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Plus, Flame, Clock, Edit2, Trash2, X, Tag } from 'lucide-react';
import { getDaysRemainingInMonth, getCurrentMonthKey } from '@repo/utils';
import { createClient } from '@/backend/supabase/client';
import {
  useBudgetsQuery,
  useBudgetMutations,
  useExpensesQuery,
  useCategoriesQuery,
  useRealtimeSync,
} from '@repo/api';
import { useCurrency } from '../components/currency-provider';
import { CategoryManagerModal } from '../components/category-manager-modal';

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

  const { format, symbol } = useCurrency();
  const currentMonthKey = getCurrentMonthKey();
  const { data: dbBudgets } = useBudgetsQuery(supabase, currentMonthKey);
  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbCategories } = useCategoriesQuery(supabase);
  const { setBudget, deleteBudget } = useBudgetMutations(supabase);

  const categories = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) return dbCategories;
    return PRESET_CATEGORIES;
  }, [dbCategories]);

  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('cat-1');
  const [limitInput, setLimitInput] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const daysRemaining = getDaysRemainingInMonth();

  const budgets = useMemo(() => {
    if (dbBudgets && dbBudgets.length > 0 && dbExpenses) {
      return dbBudgets.map((b) => {
        const cat = categories.find((c) => c.id === b.category_id) || {
          id: b.category_id,
          name: 'Category',
          color: '#64748b',
        };

        const spent = dbExpenses
          .filter((e) => e.category_id === b.category_id)
          .reduce((acc, curr) => acc + Number(curr.amount), 0);

        return {
          id: b.id,
          category_id: b.category_id,
          category: cat.name,
          color: (cat as any).color || '#64748b',
          limit: Number(b.monthly_limit),
          spent,
        };
      });
    }
    return localBudgets;
  }, [dbBudgets, dbExpenses, categories, localBudgets]);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : '0';

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitInput || isNaN(Number(limitInput))) return;

    const numLimit = parseFloat(limitInput);
    const cat = categories.find((c) => c.id === selectedCatId) || categories[0];

    if (editingBudgetId) {
      setLocalBudgets((prev) =>
        prev.map((b) =>
          b.id === editingBudgetId
            ? { ...b, category_id: cat.id, category: cat.name, color: (cat as any).color || '#64748b', limit: numLimit }
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
            color: (cat as any).color || '#64748b',
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs transition backdrop-blur-md shadow-xs cursor-pointer"
          >
            <Tag className="h-4 w-4 text-indigo-500" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => {
              setEditingBudgetId(null);
              setLimitInput('');
              setSelectedCatId(categories[0]?.id || 'cat-1');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
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
              {format(totalSpent)} / {format(totalLimit)}
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
              {format(Math.max(0, totalLimit - totalSpent))} remaining across all categories
            </p>
          </div>
        </div>

        <div className="h-3.5 w-full bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              Number(overallPercentage) > 95
                ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                : Number(overallPercentage) > 75
                ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-lg shadow-indigo-500/50'
            }`}
            style={{ width: `${Math.min(100, Number(overallPercentage))}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Cycle Time</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {daysRemaining} Days Left
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-rose-400" />
            <div>
              <p className="text-xs text-slate-400">Avg Burn Rate</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {format(totalSpent / Math.max(1, 30 - daysRemaining))} / day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Safe Daily Limit</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {format(Math.max(0, totalLimit - totalSpent) / Math.max(1, daysRemaining))} / day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Active Budgets</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {budgets.length} Categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const isOver = b.spent > b.limit;
          const isNear = b.spent >= b.limit * 0.8 && !isOver;

          return (
            <div
              key={b.id}
              className="glass-card p-5 space-y-4 relative overflow-hidden transition-all hover:scale-[1.01]"
            >
              <div className="specular-line" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {b.category}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingBudgetId(b.id);
                      setSelectedCatId(b.category_id);
                      setLimitInput(b.limit.toString());
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition"
                    title="Edit Budget"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
                    title="Delete Budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {format(b.spent)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    of {format(b.limit)}
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : ''
                    }`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: !isOver && !isNear ? b.color : undefined,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span
                  className={`font-semibold ${
                    isOver ? 'text-rose-500' : isNear ? 'text-amber-500' : 'text-slate-400'
                  }`}
                >
                  {isOver
                    ? `${format(b.spent - b.limit)} over budget`
                    : `${format(b.limit - b.spent)} left`}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingBudgetId ? 'Edit Category Budget' : 'Set Category Monthly Cap'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Spend Limit ({symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-400 font-bold text-xs">{symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 10000"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
                >
                  {editingBudgetId ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
      />
    </div>
  );
}
