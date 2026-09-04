'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  ReceiptText,
  Target,
  PieChart,
  Settings,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Download,
  Moon,
  Sun,
  Globe,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrency } from './currency-provider';
import { SupportedCurrencyCode } from '@repo/utils';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Actions' | 'Currency' | 'Appearance';
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  action: () => void;
  shortcut?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiScan?: () => void;
  onOpenAddExpense?: () => void;
  onOpenCsvImport?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenAiScan,
  onOpenAddExpense,
  onOpenCsvImport,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { setCurrency, currencyList, currency } = useCurrency();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define commands list
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        subtitle: 'Financial overview & telemetry',
        category: 'Navigation',
        icon: LayoutDashboard,
        iconColor: '#6366f1',
        action: () => router.push('/dashboard'),
      },
      {
        id: 'nav-expenses',
        title: 'Go to Expenses Ledger',
        subtitle: 'View transactions, receipts & filters',
        category: 'Navigation',
        icon: ReceiptText,
        iconColor: '#3b82f6',
        action: () => router.push('/expenses'),
      },
      {
        id: 'nav-budgets',
        title: 'Go to Budgets & Burn Rate',
        subtitle: 'Category caps & burn projections',
        category: 'Navigation',
        icon: Target,
        iconColor: '#10b981',
        action: () => router.push('/budgets'),
      },
      {
        id: 'nav-analytics',
        title: 'Go to Spending Analytics',
        subtitle: 'Breakdown charts & payment trends',
        category: 'Navigation',
        icon: PieChart,
        iconColor: '#ec4899',
        action: () => router.push('/analytics'),
      },
      {
        id: 'nav-settings',
        title: 'Go to Settings',
        subtitle: 'Profile, custom categories & currencies',
        category: 'Navigation',
        icon: Settings,
        iconColor: '#8b5cf6',
        action: () => router.push('/settings'),
      },

      // Actions
      {
        id: 'act-add-expense',
        title: 'Add New Expense',
        subtitle: 'Record an outflow transaction',
        category: 'Actions',
        icon: Plus,
        iconColor: '#6366f1',
        shortcut: 'N',
        action: () => {
          if (onOpenAddExpense) onOpenAddExpense();
          else router.push('/expenses');
        },
      },
      {
        id: 'act-ai-scan',
        title: 'AI Scan Receipt (OCR)',
        subtitle: 'Extract fields with Google Gemini Vision',
        category: 'Actions',
        icon: Sparkles,
        iconColor: '#f59e0b',
        shortcut: 'S',
        action: () => {
          if (onOpenAiScan) onOpenAiScan();
          else router.push('/expenses');
        },
      },
      {
        id: 'act-import-csv',
        title: 'Import Bank Statement (CSV)',
        subtitle: '3-step column auto-mapper wizard',
        category: 'Actions',
        icon: FileSpreadsheet,
        iconColor: '#10b981',
        action: () => {
          if (onOpenCsvImport) onOpenCsvImport();
          else router.push('/expenses');
        },
      },
      {
        id: 'act-export-csv',
        title: 'Export Ledger to Excel / CSV',
        subtitle: 'Download formatted report with UTF-8 BOM',
        category: 'Actions',
        icon: Download,
        iconColor: '#06b6d4',
        action: () => {
          window.location.href = '/api/export';
        },
      },

      // Appearance
      {
        id: 'theme-toggle',
        title: `Switch to ${theme === 'dark' ? 'Day Glass (Light)' : 'Night Glass (Dark)'} Mode`,
        subtitle: 'Toggle theme aesthetic',
        category: 'Appearance',
        icon: theme === 'dark' ? Sun : Moon,
        iconColor: '#eab308',
        shortcut: 'T',
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      },
    ];

    // Currencies
    currencyList.forEach((c) => {
      list.push({
        id: `currency-${c.code}`,
        title: `Set Active Currency to ${c.code} (${c.symbol})`,
        subtitle: `${c.flag} ${c.name} ${currency === c.code ? '• Currently Active' : ''}`,
        category: 'Currency',
        icon: Globe,
        iconColor: '#38bdf8',
        action: () => setCurrency(c.code as SupportedCurrencyCode),
      });
    });

    return list;
  }, [router, theme, setTheme, setCurrency, currencyList, currency, onOpenAddExpense, onOpenAiScan, onOpenCsvImport]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-xl w-full rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col max-h-[70vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/60 dark:border-white/10 gap-3">
          <Search className="h-5 w-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or action (e.g. 'scan', 'currency', 'budget')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-0 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-md border border-slate-300 dark:border-white/10">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Command className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No matching commands found.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try searching for pages, actions, or currencies.</p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs"
                      style={{
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        color: item.iconColor || '#6366f1',
                      }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-400">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/20">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="h-3.5 w-3.5 text-indigo-500" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-indigo-500 font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Spendy Command Bar
          </span>
        </div>
      </div>
    </div>
  );
}
