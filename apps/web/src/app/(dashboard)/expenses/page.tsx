'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Trash2,
  Edit2,
  Tag,
  CreditCard,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  RefreshCw,
  TrendingDown,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatExpenseDate, getDateRangePreset } from '@repo/utils';
import { createClient } from '../../../lib/supabase/client';
import { useExpensesQuery, useExpenseMutations, useRealtimeSync } from '@repo/api';
import { ExpenseWithCategory } from '@repo/types';

const PRESET_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining', color: '#f97316', icon: 'utensils' },
  { id: 'cat-2', name: 'Groceries', color: '#10b981', icon: 'shopping-cart' },
  { id: 'cat-3', name: 'Transportation', color: '#3b82f6', icon: 'car' },
  { id: 'cat-4', name: 'Bills & Utilities', color: '#8b5cf6', icon: 'receipt' },
  { id: 'cat-5', name: 'Entertainment', color: '#ec4899', icon: 'film' },
  { id: 'cat-6', name: 'Shopping', color: '#eab308', icon: 'shopping-bag' },
  { id: 'cat-7', name: 'Health & Fitness', color: '#06b6d4', icon: 'activity' },
  { id: 'cat-8', name: 'Others', color: '#64748b', icon: 'more-horizontal' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'net_banking', label: 'Net Banking' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Other' },
];

// Fallback initial dataset for preview / offline mode
const FALLBACK_EXPENSES: ExpenseWithCategory[] = [
  {
    id: 'exp-1',
    user_id: 'user-demo',
    category_id: 'cat-2',
    amount: 2450.0,
    payment_method: 'upi',
    spent_at: '2026-08-19T10:30:00Z',
    note: 'Whole Foods - Fresh produce & organic milk',
    receipt_storage_path: null,
    created_at: '2026-08-19T10:30:00Z',
    updated_at: '2026-08-19T10:30:00Z',
    category: {
      id: 'cat-2',
      user_id: 'user-demo',
      name: 'Groceries',
      color: '#10b981',
      icon: 'shopping-cart',
      is_system: true,
      created_at: '2026-08-19T10:30:00Z',
    },
  },
  {
    id: 'exp-2',
    user_id: 'user-demo',
    category_id: 'cat-1',
    amount: 480.0,
    payment_method: 'credit_card',
    spent_at: '2026-08-19T08:15:00Z',
    note: 'Starbucks Coffee & Almond Croissant',
    receipt_storage_path: null,
    created_at: '2026-08-19T08:15:00Z',
    updated_at: '2026-08-19T08:15:00Z',
    category: {
      id: 'cat-1',
      user_id: 'user-demo',
      name: 'Food & Dining',
      color: '#f97316',
      icon: 'utensils',
      is_system: true,
      created_at: '2026-08-19T08:15:00Z',
    },
  },
  {
    id: 'exp-3',
    user_id: 'user-demo',
    category_id: 'cat-3',
    amount: 620.0,
    payment_method: 'upi',
    spent_at: '2026-08-18T21:40:00Z',
    note: 'Uber Premier airport drop',
    receipt_storage_path: null,
    created_at: '2026-08-18T21:40:00Z',
    updated_at: '2026-08-18T21:40:00Z',
    category: {
      id: 'cat-3',
      user_id: 'user-demo',
      name: 'Transportation',
      color: '#3b82f6',
      icon: 'car',
      is_system: true,
      created_at: '2026-08-18T21:40:00Z',
    },
  },
  {
    id: 'exp-4',
    user_id: 'user-demo',
    category_id: 'cat-4',
    amount: 3200.0,
    payment_method: 'net_banking',
    spent_at: '2026-08-17T14:00:00Z',
    note: 'High-speed Broadband & Power bill',
    receipt_storage_path: null,
    created_at: '2026-08-17T14:00:00Z',
    updated_at: '2026-08-17T14:00:00Z',
    category: {
      id: 'cat-4',
      user_id: 'user-demo',
      name: 'Bills & Utilities',
      color: '#8b5cf6',
      icon: 'receipt',
      is_system: true,
      created_at: '2026-08-17T14:00:00Z',
    },
  },
  {
    id: 'exp-5',
    user_id: 'user-demo',
    category_id: 'cat-5',
    amount: 1100.0,
    payment_method: 'debit_card',
    spent_at: '2026-08-16T19:00:00Z',
    note: 'IMAX Cinema Tickets for 2',
    receipt_storage_path: null,
    created_at: '2026-08-16T19:00:00Z',
    updated_at: '2026-08-16T19:00:00Z',
    category: {
      id: 'cat-5',
      user_id: 'user-demo',
      name: 'Entertainment',
      color: '#ec4899',
      icon: 'film',
      is_system: true,
      created_at: '2026-08-16T19:00:00Z',
    },
  },
  {
    id: 'exp-6',
    user_id: 'user-demo',
    category_id: 'cat-6',
    amount: 6500.0,
    payment_method: 'credit_card',
    spent_at: '2026-08-15T16:20:00Z',
    note: 'Nike Pegasus 41 Running Shoes',
    receipt_storage_path: null,
    created_at: '2026-08-15T16:20:00Z',
    updated_at: '2026-08-15T16:20:00Z',
    category: {
      id: 'cat-6',
      user_id: 'user-demo',
      name: 'Shopping',
      color: '#eab308',
      icon: 'shopping-bag',
      is_system: true,
      created_at: '2026-08-15T16:20:00Z',
    },
  },
];

export default function ExpensesPage() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const { data: dbExpenses, isLoading, refetch } = useExpensesQuery(supabase);
  const { createExpense, updateExpense, deleteExpense, bulkDeleteExpenses } = useExpenseMutations(supabase);

  // Local fallback storage for interactive demo when DB is empty
  const [localExpenses, setLocalExpenses] = useState<ExpenseWithCategory[]>(FALLBACK_EXPENSES);

  // Active items priority: DB data if present, otherwise local state
  const rawExpenses = dbExpenses && dbExpenses.length > 0 ? dbExpenses : localExpenses;

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'last_30_days'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('cat-1');
  const [formPaymentMethod, setFormPaymentMethod] = useState('upi');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((exp) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = exp.note?.toLowerCase().includes(query);
        const catMatch = exp.category?.name.toLowerCase().includes(query);
        if (!noteMatch && !catMatch) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const catName = exp.category?.name || 'Others';
        if (exp.category_id !== selectedCategory && catName !== selectedCategory) {
          return false;
        }
      }

      // Payment Method
      if (selectedPaymentMethod !== 'all' && exp.payment_method !== selectedPaymentMethod) {
        return false;
      }

      // Date Presets
      if (datePreset !== 'all') {
        const range = getDateRangePreset(datePreset);
        const expTime = new Date(exp.spent_at).getTime();
        const start = new Date(range.start_date).getTime();
        const end = new Date(range.end_date).getTime();
        if (expTime < start || expTime > end) return false;
      }

      return true;
    });
  }, [rawExpenses, searchQuery, selectedCategory, selectedPaymentMethod, datePreset]);

  // Statistics for Current Filter
  const totalFilteredSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  // Add Expense Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount))) return;

    const chosenCat = PRESET_CATEGORIES.find((c) => c.id === formCategory) || PRESET_CATEGORIES[0];
    const newRecord: ExpenseWithCategory = {
      id: 'exp-' + Date.now(),
      user_id: 'user-demo',
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote || chosenCat.name,
      spent_at: new Date(formDate).toISOString(),
      receipt_storage_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: chosenCat.id,
        user_id: 'user-demo',
        name: chosenCat.name,
        color: chosenCat.color,
        icon: chosenCat.icon,
        is_system: true,
        created_at: new Date().toISOString(),
      },
    };

    // Update local state and trigger mutation
    setLocalExpenses((prev) => [newRecord, ...prev]);
    createExpense.mutate({
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote || chosenCat.name,
      spent_at: new Date(formDate).toISOString(),
    });

    // Reset Form
    setFormAmount('');
    setFormNote('');
    setIsAddModalOpen(false);
  };

  // Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formAmount || isNaN(Number(formAmount))) return;

    const chosenCat = PRESET_CATEGORIES.find((c) => c.id === formCategory) || PRESET_CATEGORIES[0];
    const updatedRecord: ExpenseWithCategory = {
      ...editingExpense,
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote,
      spent_at: new Date(formDate).toISOString(),
      category: {
        id: chosenCat.id,
        user_id: 'user-demo',
        name: chosenCat.name,
        color: chosenCat.color,
        icon: chosenCat.icon,
        is_system: true,
        created_at: new Date().toISOString(),
      },
    };

    setLocalExpenses((prev) => prev.map((exp) => (exp.id === editingExpense.id ? updatedRecord : exp)));
    updateExpense.mutate({
      id: editingExpense.id,
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote,
      spent_at: new Date(formDate).toISOString(),
    });

    setEditingExpense(null);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setLocalExpenses((prev) => prev.filter((exp) => exp.id !== deletingId));
    deleteExpense.mutate(deletingId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deletingId);
      return next;
    });
    setDeletingId(null);
  };

  // Bulk Delete Action
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setLocalExpenses((prev) => prev.filter((exp) => !selectedIds.has(exp.id)));
    bulkDeleteExpenses.mutate(ids);
    setSelectedIds(new Set());
  };

  const openEditModal = (exp: ExpenseWithCategory) => {
    setEditingExpense(exp);
    setFormAmount(exp.amount.toString());
    setFormCategory(exp.category_id || 'cat-1');
    setFormPaymentMethod(exp.payment_method);
    setFormNote(exp.note || '');
    setFormDate(new Date(exp.spent_at).toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Expenses Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete transaction history with instant filtering, editing, and CSV exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export"
            download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition backdrop-blur-md shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setFormAmount('');
              setFormNote('');
              setFormDate(new Date().toISOString().slice(0, 10));
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Filtered Total Spend
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalFilteredSpend)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Transactions Found
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {filteredExpenses.length} Records
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Tag className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Per Transaction
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {filteredExpenses.length > 0
                ? formatCurrency(totalFilteredSpend / filteredExpenses.length)
                : '₹0'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters Card */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by note, merchant, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_30_days', label: '30 Days' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  datePreset === preset.id
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills & Payment Method Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Categories
            </button>
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition ${
                  selectedCategory === cat.name
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Payment Method Select */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Transactions Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {selectedIds.size > 0 && selectedIds.size === filteredExpenses.length ? (
                      <CheckSquare className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Transaction & Note
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-base">No expenses matched your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding a new expense record.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const catColor = item.category?.color || '#64748b';
                  const catName = item.category?.name || 'Others';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-slate-400 hover:text-indigo-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{item.note || catName}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            ID: {item.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${catColor}18`,
                            color: catColor,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catColor }}
                          />
                          {catName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5">
                          {item.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {formatExpenseDate(item.spent_at)}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white text-right whitespace-nowrap">
                        {formatCurrency(Number(item.amount))}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Record New Expense</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full text-2xl font-bold px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Note / Merchant
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery store, Uber to airport..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Expense</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full text-2xl font-bold px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Note / Merchant
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition"
                >
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl space-y-4 shadow-2xl border border-rose-500/30">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Transaction</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
