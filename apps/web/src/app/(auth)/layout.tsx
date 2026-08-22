import React from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { ThemeToggle } from '@/frontend/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-400 bg-clip-text text-transparent">
            Spendy
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
