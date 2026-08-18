import { Database, PaymentMode } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];

export interface ExpenseWithCategory extends Expense {
  category?: Category | null;
}

export interface BudgetWithProgress extends Budget {
  category?: Category;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  is_over_budget: boolean;
  status: 'safe' | 'warning' | 'exceeded';
  daily_allowance_remaining: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  percentage: number;
  transaction_count: number;
}

export interface DailySpendPoint {
  date: string;
  amount: number;
  accumulated: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMode;
  label: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface SpendingAnalytics {
  total_spend: number;
  previous_period_spend: number;
  percentage_change: number;
  transaction_count: number;
  average_daily_spend: number;
  highest_spending_category: CategorySummary | null;
  categories: CategorySummary[];
  daily_trends: DailySpendPoint[];
  payment_methods: PaymentMethodBreakdown[];
}

export interface DateRangeFilter {
  start_date: string; // ISO String
  end_date: string;   // ISO String
  preset?: 'today' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';
}

export interface ExpenseQueryFilters {
  date_range?: DateRangeFilter;
  category_ids?: string[];
  payment_methods?: PaymentMode[];
  min_amount?: number;
  max_amount?: number;
  search_query?: string;
  page?: number;
  limit?: number;
}

export type ThemeMode = 'system' | 'light' | 'dark';
