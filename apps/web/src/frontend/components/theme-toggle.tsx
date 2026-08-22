'use client';

import * as React from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/40 dark:bg-white/[0.06] border border-white/50 dark:border-white/10" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative p-2.5 rounded-xl bg-white/40 dark:bg-white/[0.06] backdrop-blur-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-200 shadow-sm cursor-pointer"
      aria-label="Toggle visual theme"
    >
      <Sun className={`h-5 w-5 text-amber-500 transition-all ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      <Moon className={`absolute top-2.5 left-2.5 h-5 w-5 text-indigo-400 transition-all ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
    </button>
  );
}
