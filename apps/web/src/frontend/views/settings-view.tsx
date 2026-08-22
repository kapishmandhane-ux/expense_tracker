'use client';

import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';

export function SettingsView() {
  const [currency, setCurrency] = useState('INR');
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System & Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Preferences, theme mode, security, and device sync
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 space-y-4">
        <div className="specular-line" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-500" />
          Profile Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Alex Johnson"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="alex@example.com"
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="glass-card p-6 space-y-4">
        <div className="specular-line" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          Preferences & Aesthetics
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Visual Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between Night Glass and Day Glass mode
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Default Currency</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary symbol across charts and ledgers
              </p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Mobile Biometrics (FaceID / Fingerprint)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Require biometric unlock when foregrounding Expo mobile app
              </p>
            </div>
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={(e) => setBiometricEnabled(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
