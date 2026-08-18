import React from 'react';

interface MetricCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export function MetricCard({
  title,
  amount,
  subtitle,
  icon,
  trend,
  accentColor = 'rgba(99, 102, 241, 0.2)',
}: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-6 bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/70 dark:border-white/[0.12] shadow-lg shadow-slate-200/40 dark:shadow-2xl dark:shadow-black/40 transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-400/30 hover:scale-[1.01]">
      {/* Ambient Top Glow */}
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
      {/* Specular Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.06] border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {amount}
        </h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
