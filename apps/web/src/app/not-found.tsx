import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md w-full p-8 space-y-6 relative">
        <div className="specular-line" />
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/10">
          <Compass className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">404 - Page Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            The page or resource you are looking for does not exist or has been moved.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
