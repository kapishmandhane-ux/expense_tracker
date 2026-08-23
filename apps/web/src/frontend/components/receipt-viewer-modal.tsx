'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Receipt,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatExpenseDate } from '@repo/utils';

export interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
  expense?: {
    note?: string | null;
    amount?: number | string;
    spent_at?: string;
    categoryName?: string;
  } | null;
}

export function ReceiptViewerModal({
  isOpen,
  onClose,
  receiptUrl,
  expense,
}: ReceiptViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !receiptUrl) return null;

  const isPdf =
    receiptUrl.toLowerCase().endsWith('.pdf') ||
    receiptUrl.toLowerCase().includes('.pdf?') ||
    receiptUrl.includes('application/pdf');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `receipt_${expense?.note || 'document'}_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(receiptUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-4xl w-full h-[85vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {expense?.note || 'Receipt Document'}
              </h3>
              <p className="text-xs text-slate-400">
                {expense?.amount ? `${formatCurrency(Number(expense.amount))} • ` : ''}
                {expense?.spent_at ? formatExpenseDate(expense.spent_at) : 'Attached Receipt'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs px-1.5 text-slate-400 font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="px-2 py-1 text-xs rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                  title="Reset View"
                >
                  Reset
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition"
              title="Download File"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>

            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
              title="Open Original in New Tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 text-slate-400 transition"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-950/60 relative select-none">
          {isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">PDF Document Attached</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  This receipt is stored as a PDF file. You can open it in an interactive viewer or download it directly.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open PDF in Tab</span>
                </a>
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="transition-transform duration-200 ease-out flex items-center justify-center min-h-full min-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptUrl}
                alt="Receipt"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '70vh',
                }}
                className="rounded-xl shadow-2xl object-contain transition-transform"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
