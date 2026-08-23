'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  parseCsvText,
  autoDetectColumnMapping,
  processImportRows,
  ExpenseImportRow,
  ColumnMapping,
  formatCurrency,
} from '@repo/utils';
import { CreateExpenseInput } from '@repo/validators';

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onImportSuccess: (expenses: CreateExpenseInput[]) => Promise<void>;
}

export function CsvImportModal({
  isOpen,
  onClose,
  categories,
  onImportSuccess,
}: CsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateCol: '',
    amountCol: '',
    noteCol: '',
    categoryCol: '',
    paymentMethodCol: '',
  });
  const [processedRows, setProcessedRows] = useState<ExpenseImportRow[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>(categories[0]?.id || '');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsvText(text);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setImportError('Could not find valid records in the selected CSV file.');
        return;
      }

      setCsvHeaders(parsed.headers);
      setRawRows(parsed.rows);

      // Auto-detect columns
      const detected = autoDetectColumnMapping(parsed.headers);
      setMapping(detected);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleProceedToPreview = () => {
    if (!mapping.dateCol || !mapping.amountCol) {
      setImportError('Date and Amount column mappings are required.');
      return;
    }

    setImportError(null);
    const processed = processImportRows(rawRows, mapping);
    setProcessedRows(processed);
    setStep('preview');
  };

  const handleExecuteImport = async () => {
    const validRows = processedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setImportError('No valid rows found to import.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      // Map category name to category_id
      const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

      const payload: CreateExpenseInput[] = validRows.map((r) => {
        let categoryId = defaultCategory;
        if (r.categoryName) {
          const match = catMap.get(r.categoryName.toLowerCase());
          if (match) categoryId = match;
        }

        return {
          amount: r.amount,
          spent_at: new Date(r.date).toISOString(),
          note: r.note,
          category_id: categoryId || undefined,
          payment_method: r.paymentMethod,
        };
      });

      await onImportSuccess(payload);
      setIsImporting(false);
      onClose();
    } catch (err: any) {
      setIsImporting(false);
      setImportError(err?.message || 'Failed to complete batch import.');
    }
  };

  const validCount = processedRows.filter((r) => r.isValid).length;
  const invalidCount = processedRows.length - validCount;
  const totalAmount = processedRows
    .filter((r) => r.isValid)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl space-y-6 shadow-2xl border border-slate-200/80 dark:border-white/10 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Bank Statement (CSV)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'upload' && 'Upload a CSV export from your bank or expense sheet'}
                {step === 'mapping' && `Step 2: Map columns for ${fileName}`}
                {step === 'preview' && `Step 3: Review ${processedRows.length} transactions before importing`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* STEP 1: Upload Dropzone */}
        {step === 'upload' && (
          <div className="py-8 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-500/[0.02]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 shadow-lg shadow-indigo-500/10">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag and drop your statement CSV here, or <span className="text-indigo-500 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports SBI, HDFC, ICICI, Axis, Chase, or generic CSV spreadsheets
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We detected the columns below. Ensure the fields match your CSV headers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Column <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.dateCol}
                  onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Date Column --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount / Debit Column <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapping.amountCol}
                  onChange={(e) => setMapping({ ...mapping, amountCol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Amount Column --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Description Column
                </label>
                <select
                  value={mapping.noteCol}
                  onChange={(e) => setMapping({ ...mapping, noteCol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Optional (Uses Default) --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Column
                </label>
                <select
                  value={mapping.categoryCol || ''}
                  onChange={(e) => setMapping({ ...mapping, categoryCol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Optional (Auto/Default) --</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Category for unmapped rows:
              </label>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToPreview}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <span>Preview Rows</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview Table & Confirm */}
        {step === 'preview' && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Valid Records</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{validCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Invalid / Skipped</span>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{invalidCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Total Amount</span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalAmount)}</p>
              </div>
            </div>

            {/* Preview List */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                  {processedRows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? '' : 'bg-rose-500/5 opacity-60'}>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span title={row.validationError || 'Invalid row'}>
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">{row.date}</td>
                      <td className="p-2.5 text-slate-900 dark:text-white truncate max-w-xs">{row.note}</td>
                      <td className="p-2.5 uppercase font-mono text-[10px] text-slate-500">{row.paymentMethod}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {processedRows.length > 50 && (
              <p className="text-[11px] text-slate-400 text-center">
                Showing first 50 of {processedRows.length} rows
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep('mapping')}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Adjust Mapping</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing {validCount} Expenses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm & Import ({validCount} Records)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
