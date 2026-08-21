'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md w-full p-8 space-y-6 relative">
        <div className="specular-line" />
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {error.message || 'An unexpected error occurred while rendering this view.'}
          </p>
        </div>
        <div>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/25"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
