'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  amount: number;
  paymentMethod: string;
  date: string;
  note?: string;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: '1',
    title: 'Whole Foods Market',
    category: 'Groceries',
    categoryColor: '#10b981',
    amount: 2450.0,
    paymentMethod: 'upi',
    date: '2026-08-19T10:30:00Z',
    note: 'Weekly essentials and fresh produce',
  },
  {
    id: '2',
    title: 'Starbucks Coffee',
    category: 'Food & Dining',
    categoryColor: '#f97316',
    amount: 480.0,
    paymentMethod: 'credit_card',
    date: '2026-08-19T08:15:00Z',
    note: 'Espresso & croissant with client',
  },
  {
    id: '3',
    title: 'Uber Premier Ride',
    category: 'Transportation',
    categoryColor: '#3b82f6',
    amount: 620.0,
    paymentMethod: 'upi',
    date: '2026-08-18T21:40:00Z',
    note: 'Airport drop-off',
  },
  {
    id: '4',
    title: 'Electricity & Broadband Bill',
    category: 'Bills & Utilities',
    categoryColor: '#8b5cf6',
    amount: 3200.0,
    paymentMethod: 'net_banking',
    date: '2026-08-17T14:00:00Z',
    note: 'High-speed fiber & power utility',
  },
  {
    id: '5',
    title: 'IMAX Cinema Tickets',
    category: 'Entertainment',
    categoryColor: '#ec4899',
    amount: 1100.0,
    paymentMethod: 'debit_card',
    date: '2026-08-16T19:00:00Z',
    note: '2x evening tickets',
  },
  {
    id: '6',
    title: 'Nike Running Shoes',
    category: 'Shopping',
    categoryColor: '#eab308',
    amount: 6500.0,
    paymentMethod: 'credit_card',
    date: '2026-08-15T16:20:00Z',
    note: 'Pegasus 41 running gear',
  },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [note, setNote] = useState('');

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.note && exp.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || exp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      title: title || `${category} Expense`,
      category,
      categoryColor:
        category === 'Food & Dining'
          ? '#f97316'
          : category === 'Groceries'
          ? '#10b981'
          : category === 'Transportation'
          ? '#3b82f6'
          : category === 'Shopping'
          ? '#eab308'
          : '#8b5cf6',
      amount: parseFloat(amount),
      paymentMethod,
      date: new Date().toISOString(),
      note,
    };

    setExpenses([newExpense, ...expenses]);
    setTitle('');
    setAmount('');
    setNote('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Expense Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, edit and track every single transaction
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="specular-line" />
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Categories</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Groceries">Groceries</option>
            <option value="Transportation">Transportation</option>
            <option value="Bills & Utilities">Bills & Utilities</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
          </select>

          <button
            onClick={() => {
              const csv = [
                'ID,Title,Category,Amount,PaymentMethod,Date,Note',
                ...filteredExpenses.map(
                  (e) =>
                    `"${e.id}","${e.title}","${e.category}",${e.amount},"${e.paymentMethod}","${e.date}","${e.note || ''}"`
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="specular-line" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-white/[0.03] border-b border-slate-200/60 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction / Merchant</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
              {filteredExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {exp.title}
                    </p>
                    {exp.note && (
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
                        {exp.note}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-xs"
                      style={{ backgroundColor: exp.categoryColor }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                      {exp.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(exp.date).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      ₹{exp.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-modal w-full max-w-md p-6 rounded-3xl relative">
            <div className="specular-line" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Add Quick Expense
            </h2>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-2xl font-black px-4 py-3 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Merchant / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks, Uber, Grocery store"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="upi">UPI</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="net_banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional context or receipt tag..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
