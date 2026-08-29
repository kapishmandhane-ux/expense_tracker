'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode,
  CURRENCY_LIST,
  formatCurrency,
  getCurrencySymbol,
} from '@repo/utils';
import { createClient } from '@/backend/supabase/client';

export interface CurrencyContextType {
  currency: SupportedCurrencyCode;
  setCurrency: (code: SupportedCurrencyCode) => void;
  format: (
    amount: number | null | undefined,
    options?: { showDecimals?: boolean; compact?: boolean }
  ) => string;
  symbol: string;
  currencyList: typeof CURRENCY_LIST;
  currencies: typeof SUPPORTED_CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
  format: (amount) => formatCurrency(amount, 'INR'),
  symbol: '₹',
  currencyList: CURRENCY_LIST,
  currencies: SUPPORTED_CURRENCIES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrencyCode>('INR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // 1. Read stored currency preference from localStorage
      const stored = localStorage.getItem('spendy_currency') as SupportedCurrencyCode | null;
      if (stored && SUPPORTED_CURRENCIES[stored]) {
        setCurrencyState(stored);
      } else {
        // 2. Fetch user's profile currency code from Supabase if logged in
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            (supabase.from('profiles') as any)
              .select('currency_code')
              .eq('id', data.user.id)
              .single()
              .then(({ data: profile }: any) => {
                if (profile?.currency_code && SUPPORTED_CURRENCIES[profile.currency_code as SupportedCurrencyCode]) {
                  setCurrencyState(profile.currency_code as SupportedCurrencyCode);
                  localStorage.setItem('spendy_currency', profile.currency_code);
                }
              });
          }
        });
      }
    } catch {}
  }, []);

  const setCurrency = (code: SupportedCurrencyCode) => {
    if (!SUPPORTED_CURRENCIES[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem('spendy_currency', code);
      // Sync with Supabase profile
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          (supabase.from('profiles') as any)
            .update({ currency_code: code })
            .eq('id', data.user.id)
            .then(() => {});
        }
      });
    } catch {}
  };

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const format = (
    amount: number | null | undefined,
    options?: { showDecimals?: boolean; compact?: boolean }
  ) => {
    return formatCurrency(amount, currency, options);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format,
        symbol,
        currencyList: CURRENCY_LIST,
        currencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
