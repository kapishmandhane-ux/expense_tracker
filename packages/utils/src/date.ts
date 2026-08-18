import { DateRangeFilter } from '@repo/types';

/**
 * Returns Start and End ISO strings for common presets
 */
export function getDateRangePreset(
  preset: 'today' | 'this_week' | 'this_month' | 'last_30_days'
): DateRangeFilter {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'this_week': {
      // Start Monday
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'last_30_days':
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    preset,
  };
}

/**
 * Formats ISO date string to human-friendly format
 * e.g. "Aug 19, 2026" or "Today, 1:15 AM"
 */
export function formatExpenseDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format month key YYYY-MM-01
 */
export function getCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Days remaining in the current month
 */
export function getDaysRemainingInMonth(date: Date = new Date()): number {
  const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const currentDay = date.getDate();
  return Math.max(1, totalDays - currentDay + 1);
}
