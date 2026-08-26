'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  Store,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@repo/utils';
import { CreateExpenseInput } from '@repo/validators';

export interface AiReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; color?: string }[];
  onSaveExpense: (expense: CreateExpenseInput, file?: File) => Promise<void>;
}

export function AiReceiptScannerModal({
  isOpen,
  onClose,
  categories,
  onSaveExpense,
}: AiReceiptScannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanConfidence, setScanConfidence] = useState<number>(0.92);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted & Editable Fields
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(categories[0]?.id || 'cat-1');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cash' | 'other'>('upi');
  const [items, setItems] = useState<{ name: string; price: number }[]>([]);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Start AI Scan
    setIsScanning(true);
    setScanStep('Analyzing receipt geometry & OCR text...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate multi-step telemetry for visual polish
      const stepTimer1 = setTimeout(() => {
        setScanStep('Extracting vendor, items, and tax totals...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setScanStep('Matching category and payment method...');
      }, 1400);

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        throw new Error('Failed to parse receipt with AI vision.');
      }

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        setMerchant(d.merchant || 'Store Merchant');
        setAmount(d.amount ? d.amount.toString() : '0.00');
        setDate(d.date || new Date().toISOString().slice(0, 10));
        setPaymentMethod(d.paymentMethod || 'upi');
        setScanConfidence(d.confidence || 0.92);
        setItems(d.items || []);

        // Match category name to category_id
        if (d.category) {
          const matchedCat = categories.find(
            (c) => c.name.toLowerCase() === d.category.toLowerCase()
          );
          if (matchedCat) {
            setCategory(matchedCat.id);
          } else {
            setCategory(categories[0]?.id || 'cat-1');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error scanning receipt. You can manually enter details.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await onSaveExpense(
        {
          amount: parseFloat(amount),
          spent_at: new Date(date).toISOString(),
          note: merchant || 'Scanned Expense',
          category_id: category,
          payment_method: paymentMethod,
        },
        selectedFile || undefined
      );

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err?.message || 'Failed to save scanned expense.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setMerchant('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setItems([]);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-3xl w-full p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl border border-indigo-500/20 max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Receipt Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Smart OCR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly extract merchant, amount, category, and date from any receipt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload State (Initial) */}
        {!imagePreview ? (
          <div className="py-8 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-500/[0.03] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 flex items-center justify-center text-indigo-500 mb-4 shadow-lg shadow-indigo-500/10 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                Drop your receipt image or bill here
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Supports PNG, JPG, WEBP, and PDF receipts from restaurants, supermarkets, stores, and fuel stations
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Vision Auto-Extraction Enabled</span>
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side Review State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
            
            {/* Left: Receipt Preview & Scanning Animation */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-200/40 dark:border-white/10 flex flex-col items-center justify-center p-3 min-h-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Receipt scan"
                className={`max-h-[320px] w-auto object-contain rounded-xl transition-all duration-300 ${
                  isScanning ? 'brightness-50 blur-[1px]' : ''
                }`}
              />

              {/* Scanning HUD Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm text-center">
                  <div className="relative w-full h-1 bg-indigo-500/40 overflow-hidden mb-6 shadow-lg shadow-indigo-500/50 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/2 animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
                  <p className="text-sm font-bold text-white tracking-wide">AI Vision Processing</p>
                  <p className="text-xs text-indigo-200/80 mt-1 animate-pulse">{scanStep}</p>
                </div>
              )}

              {/* Action Buttons Below Image */}
              {!isScanning && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Rescan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Extracted Editable Fields */}
            <form onSubmit={handleSave} className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Extracted Details
                  </span>
                  {!isScanning && merchant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{Math.round(scanConfidence * 100)}% AI Accuracy</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Total Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-base font-bold text-indigo-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 text-lg font-bold rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Merchant / Store */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Merchant / Vendor Name
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        placeholder="e.g. Starbucks Reserve"
                        className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Category & Payment Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="upi">UPI</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="net_banking">Net Banking</option>
                        <option value="cash">Cash</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save CTA */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isScanning}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm & Save Expense</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
