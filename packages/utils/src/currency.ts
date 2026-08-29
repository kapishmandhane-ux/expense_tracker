export const SUPPORTED_CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound', flag: '🇬🇧' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen', flag: '🇯🇵' },
  CAD: { code: 'CAD', symbol: 'CA$', locale: 'en-CA', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', locale: 'en-AU', name: 'Australian Dollar', flag: '🇦🇺' },
  AED: { code: 'AED', symbol: 'AED', locale: 'ar-AE', name: 'UAE Dirham', flag: '🇦🇪' },
} as const;

export type SupportedCurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const CURRENCY_LIST = Object.values(SUPPORTED_CURRENCIES);

/**
 * Format standard currency string e.g. "₹1,24,500.00" or "$12,450.00"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = 'INR',
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const config =
    SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode] ||
    SUPPORTED_CURRENCIES.INR;

  if (options?.compact) {
    return formatCompactCurrency(safeAmount, currencyCode);
  }

  const fractionDigits = options?.showDecimals === false || config.code === 'JPY' ? 0 : 2;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safeAmount);
  } catch {
    return `${config.symbol}${safeAmount.toFixed(fractionDigits)}`;
  }
}

/**
 * Formats large amounts compactly, e.g. "₹12.5k", "₹1.4M", "₹2.5Cr"
 */
export function formatCompactCurrency(
  amount: number,
  currencyCode: string = 'INR'
): string {
  const config =
    SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode] ||
    SUPPORTED_CURRENCIES.INR;

  if (currencyCode === 'INR') {
    if (Math.abs(amount) >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100_000) {
      return `₹${(amount / 100_000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1)}k`;
    }
    return `₹${amount.toFixed(0)}`;
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount}`;
  }
}

/**
 * Parse string into numeric float
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  const config = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode];
  return config ? config.symbol : '₹';
}
