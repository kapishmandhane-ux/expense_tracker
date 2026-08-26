'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Edit2,
  Tag,
  CreditCard,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  TrendingDown,
  Receipt,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatExpenseDate, getDateRangePreset } from '@repo/utils';
import { createClient } from '@/backend/supabase/client';
import {
  useExpensesQuery,
  useCategoriesQuery,
  useExpenseMutations,
  useReceiptUpload,
  useRealtimeSync,
} from '@repo/api';
import { ExpenseWithCategory } from '@repo/types';
import { CreateExpenseInput } from '@repo/validators';
import { ReceiptViewerModal } from '../components/receipt-viewer-modal';
import { CsvImportModal } from '../components/csv-import-modal';
import { AiReceiptScannerModal } from '../components/ai-receipt-scanner-modal';

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
];

export function ExpensesView() {
  const supabase = useMemo(() => createClient(), []);
  useRealtimeSync(supabase);

  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbCategories } = useCategoriesQuery(supabase);
  const {
    createExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    batchCreateExpenses,
  } = useExpenseMutations(supabase);
  const { uploadReceipt, getReceiptUrl, isUploading: isUploadingReceipt } = useReceiptUpload(supabase);

  const categories = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) return dbCategories;
    return PRESET_CATEGORIES;
  }, [dbCategories]);

  const [localExpenses, setLocalExpenses] = useState<ExpenseWithCategory[]>(FALLBACK_EXPENSES);
  const rawExpenses = dbExpenses && dbExpenses.length > 0 ? dbExpenses : localExpenses;

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'last_30_days'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{
    url: string;
    expense: { note?: string | null; amount?: number; spent_at?: string };
  } | null>(null);

  // Form State
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('cat-1');
  const [formPaymentMethod, setFormPaymentMethod] = useState('upi');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formReceiptPath, setFormReceiptPath] = useState<string | null>(null);
  const [formReceiptPreview, setFormReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((exp) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = exp.note?.toLowerCase().includes(query);
        const catMatch = exp.category?.name.toLowerCase().includes(query);
        if (!noteMatch && !catMatch) return false;
      }

      if (selectedCategory !== 'all') {
        const catName = exp.category?.name || 'Others';
        if (exp.category_id !== selectedCategory && catName !== selectedCategory) {
          return false;
        }
      }

      if (selectedPaymentMethod !== 'all' && exp.payment_method !== selectedPaymentMethod) {
        return false;
      }

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

  const totalFilteredSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  // Export URL computed with active filters
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedPaymentMethod !== 'all') params.set('paymentMethod', selectedPaymentMethod);
    if (datePreset !== 'all') {
      const range = getDateRangePreset(datePreset);
      params.set('startDate', range.start_date);
      params.set('endDate', range.end_date);
    }
    const qs = params.toString();
    return `/api/export${qs ? `?${qs}` : ''}`;
  }, [selectedCategory, selectedPaymentMethod, datePreset]);

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

  // Handle receipt file drop or selection
  const handleReceiptFile = async (file: File) => {
    if (!file) return;
    // Show instant local thumbnail preview
    const localUrl = URL.createObjectURL(file);
    setFormReceiptPreview(localUrl);

    // Upload to Supabase Storage
    const result = await uploadReceipt(file);
    if (result.path) {
      setFormReceiptPath(result.path);
      setFormReceiptPreview(result.url);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount))) return;

    const chosenCat = categories.find((c) => c.id === formCategory) || categories[0];
    const newRecord: ExpenseWithCategory = {
      id: 'exp-' + Date.now(),
      user_id: 'user-demo',
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote || chosenCat.name,
      spent_at: new Date(formDate).toISOString(),
      receipt_storage_path: formReceiptPath,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: chosenCat.id,
        user_id: 'user-demo',
        name: chosenCat.name,
        color: (chosenCat as any).color || '#64748b',
        icon: (chosenCat as any).icon || 'tag',
        is_system: true,
        created_at: new Date().toISOString(),
      },
    };

    setLocalExpenses((prev) => [newRecord, ...prev]);
    createExpense.mutate({
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote || chosenCat.name,
      spent_at: new Date(formDate).toISOString(),
      receipt_storage_path: formReceiptPath || undefined,
    });

    setFormAmount('');
    setFormNote('');
    setFormReceiptPath(null);
    setFormReceiptPreview(null);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formAmount || isNaN(Number(formAmount))) return;

    const chosenCat = categories.find((c) => c.id === formCategory) || categories[0];
    const updatedRecord: ExpenseWithCategory = {
      ...editingExpense,
      amount: parseFloat(formAmount),
      category_id: chosenCat.id,
      payment_method: formPaymentMethod as any,
      note: formNote,
      spent_at: new Date(formDate).toISOString(),
      receipt_storage_path: formReceiptPath,
      category: {
        id: chosenCat.id,
        user_id: 'user-demo',
        name: chosenCat.name,
        color: (chosenCat as any).color || '#64748b',
        icon: (chosenCat as any).icon || 'tag',
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
      receipt_storage_path: formReceiptPath || undefined,
    });

    setEditingExpense(null);
    setFormReceiptPath(null);
    setFormReceiptPreview(null);
  };

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
    setFormCategory(exp.category_id || categories[0]?.id || 'cat-1');
    setFormPaymentMethod(exp.payment_method);
    setFormNote(exp.note || '');
    setFormDate(new Date(exp.spent_at).toISOString().slice(0, 10));
    setFormReceiptPath(exp.receipt_storage_path || null);
    setFormReceiptPreview(getReceiptUrl(exp.receipt_storage_path));
  };

  const handleBatchImportSuccess = async (imported: CreateExpenseInput[]) => {
    try {
      await batchCreateExpenses.mutateAsync(imported);
    } catch {
      // Optimistic local add if offline
      const newItems: ExpenseWithCategory[] = imported.map((imp, idx) => ({
        id: 'imp-' + Date.now() + '-' + idx,
        user_id: 'user-demo',
        amount: imp.amount,
        category_id: imp.category_id || 'cat-8',
        payment_method: imp.payment_method || 'upi',
        note: imp.note || 'Imported Transaction',
        spent_at: typeof imp.spent_at === 'string' ? imp.spent_at : imp.spent_at.toISOString(),
        receipt_storage_path: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null,
      }));
      setLocalExpenses((prev) => [...newItems, ...prev]);
    }
  };

  const handleAiScanSaveExpense = async (input: CreateExpenseInput, file?: File) => {
    let storagePath: string | null = null;
    if (file) {
      const uploadRes = await uploadReceipt(file);
      if (uploadRes.path) {
        storagePath = uploadRes.path;
      }
    }

    const chosenCat = categories.find((c) => c.id === input.category_id) || categories[0];
    const newRecord: ExpenseWithCategory = {
      id: 'exp-' + Date.now(),
      user_id: 'user-demo',
      amount: input.amount,
      category_id: chosenCat.id,
      payment_method: input.payment_method || 'upi',
      note: input.note || chosenCat.name,
      spent_at: typeof input.spent_at === 'string' ? input.spent_at : input.spent_at.toISOString(),
      receipt_storage_path: storagePath,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: chosenCat.id,
        user_id: 'user-demo',
        name: chosenCat.name,
        color: (chosenCat as any).color || '#64748b',
        icon: (chosenCat as any).icon || 'tag',
        is_system: true,
        created_at: new Date().toISOString(),
      },
    };

    setLocalExpenses((prev) => [newRecord, ...prev]);
    try {
      await createExpense.mutateAsync({
        amount: input.amount,
        category_id: chosenCat.id,
        payment_method: input.payment_method || 'upi',
        note: input.note || chosenCat.name,
        spent_at: typeof input.spent_at === 'string' ? input.spent_at : input.spent_at.toISOString(),
        receipt_storage_path: storagePath || undefined,
      });
    } catch (err) {
      console.warn('Saved expense locally in offline/fallback mode:', err);
    }
  };

  const openReceiptViewer = (exp: ExpenseWithCategory) => {
    const url = getReceiptUrl(exp.receipt_storage_path);
    if (url) {
      setViewingReceipt({
        url,
        expense: {
          note: exp.note,
          amount: Number(exp.amount),
          spent_at: exp.spent_at,
        },
      });
    }
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
            Complete transaction history with receipt attachments, CSV import/export, and instant filtering
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Scan Receipt Button */}
          <button
            onClick={() => setIsAiScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-600 dark:text-indigo-300 transition backdrop-blur-md shadow-sm cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>AI Scan Receipt</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition backdrop-blur-md shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
            <span>Import CSV</span>
          </button>

          {/* Export CSV Button */}
          <a
            href={exportUrl}
            download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition backdrop-blur-md shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Export CSV</span>
          </a>

          {/* Add Expense Button */}
          <button
            onClick={() => {
              setFormAmount('');
              setFormNote('');
              setFormReceiptPath(null);
              setFormReceiptPreview(null);
              setFormDate(new Date().toISOString().slice(0, 10));
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition active:scale-[0.98] cursor-pointer"
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
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by merchant, note, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_30_days', label: 'Last 30D' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment:</span>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Modes</option>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedPaymentMethod !== 'all' || datePreset !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPaymentMethod('all');
                setDatePreset('all');
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="glass-panel p-3 rounded-2xl flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <CheckSquare className="h-4 w-4 text-indigo-500" />
            <span>{selectedIds.size} expense(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow transition cursor-pointer"
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
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Receipt
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
                  <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
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
                  const hasReceipt = Boolean(item.receipt_storage_path);

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
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
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
                      {/* Receipt Indicator Cell */}
                      <td className="p-4 text-center">
                        {hasReceipt ? (
                          <button
                            onClick={() => openReceiptViewer(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium transition cursor-pointer"
                            title="View Receipt Lightbox"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white text-right whitespace-nowrap">
                        {formatCurrency(Number(item.amount))}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
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

      {/* Add Expense Modal with Drag-and-Drop Receipt Dropzone */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10 max-h-[92vh] overflow-y-auto">
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
                  {categories.map((cat) => (
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
                    required
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
                  placeholder="e.g., Trader Joe's grocery run"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Receipt Dropzone Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Receipt Attachment (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleReceiptFile(e.target.files[0]);
                  }}
                />

                {formReceiptPreview ? (
                  <div className="relative p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formReceiptPreview}
                        alt="Receipt preview"
                        className="h-12 w-12 rounded-xl object-cover border border-indigo-500/30"
                        onError={(e) => {
                          (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>';
                        }}
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Receipt Attached</span>
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Ready to save</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormReceiptPath(null);
                        setFormReceiptPreview(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Remove Attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleReceiptFile(e.dataTransfer.files[0]);
                    }}
                    className="border border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-500/[0.02]"
                  >
                    {isUploadingReceipt ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-500 py-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading receipt to storage...</span>
                      </div>
                    ) : (
                      <>
                        <Paperclip className="h-5 w-5 text-slate-400 mb-1" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Click to upload or drag receipt image
                        </p>
                        <p className="text-[11px] text-slate-400">PNG, JPG, WEBP, or PDF (max 10MB)</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploadingReceipt}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl border border-slate-200/80 dark:border-white/10 max-h-[92vh] overflow-y-auto">
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
                  {categories.map((cat) => (
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
                    required
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

              {/* Edit Receipt Dropzone Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Receipt Attachment
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleReceiptFile(e.target.files[0]);
                  }}
                />

                {formReceiptPreview ? (
                  <div className="relative p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formReceiptPreview}
                        alt="Receipt"
                        className="h-12 w-12 rounded-xl object-cover border border-indigo-500/30"
                        onError={(e) => {
                          (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>';
                        }}
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">Receipt Attached</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-indigo-500 hover:underline text-[11px] mt-0.5 block"
                        >
                          Replace File
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormReceiptPath(null);
                        setFormReceiptPreview(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Remove Attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleReceiptFile(e.dataTransfer.files[0]);
                    }}
                    className="border border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-500/[0.02]"
                  >
                    <Paperclip className="h-5 w-5 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upload receipt image or PDF
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl space-y-4 shadow-2xl border border-slate-200/80 dark:border-white/10 text-center">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Expense Record?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This transaction will be permanently removed from your history. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Lightbox Viewer */}
      {viewingReceipt && (
        <ReceiptViewerModal
          isOpen={Boolean(viewingReceipt)}
          onClose={() => setViewingReceipt(null)}
          receiptUrl={viewingReceipt.url}
          expense={viewingReceipt.expense}
        />
      )}

      {/* CSV Bank Statement Importer Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
        onImportSuccess={handleBatchImportSuccess}
      />

      {/* AI Receipt Scanner Modal */}
      <AiReceiptScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        categories={categories}
        onSaveExpense={handleAiScanSaveExpense}
      />
    </div>
  );
}
