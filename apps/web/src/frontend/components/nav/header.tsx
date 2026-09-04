'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import { Bell, Plus, Wallet, ChevronDown, Check, Search, Command } from 'lucide-react';
import { useCurrency } from '../currency-provider';
import { SupportedCurrencyCode } from '@repo/utils';
import { CommandPalette } from '../command-palette';

export function Header() {
  const { currency, setCurrency, currencyList } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global Ctrl + K / Cmd + K keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrencyObj = currencyList.find((c) => c.code === currency) || currencyList[0];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 glass-nav border-b border-white/60 dark:border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-400 bg-clip-text text-transparent">
                Spendy
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
          </div>

          {/* Quick Search / Command Palette Bar */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs hover:bg-white/60 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
            title="Open Command Palette"
          >
            <Search className="h-3.5 w-3.5 text-indigo-500" />
            <span>Search or jump to...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-300 rounded border border-slate-300/60 dark:border-white/10">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-xl bg-white/40 dark:bg-white/[0.06] border border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-300"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Currency Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCurrencyOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/[0.06] backdrop-blur-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Change Currency"
            >
              <span>{currentCurrencyObj.flag}</span>
              <span className="font-mono">{currentCurrencyObj.code}</span>
              <span className="text-slate-400 text-[11px] font-normal">({currentCurrencyObj.symbol})</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel p-1.5 shadow-2xl border border-slate-200/80 dark:border-white/10 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-white/5">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Currency
                </div>
                <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
                  {currencyList.map((c) => {
                    const isSelected = c.code === currency;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code as SupportedCurrencyCode);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.code}</span>
                          <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            ({c.symbol})
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/expenses"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Expense</span>
          </Link>

          <button
            className="p-2.5 rounded-xl bg-white/40 dark:bg-white/[0.06] backdrop-blur-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <ThemeToggle />

          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm">
            <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
              KM
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
