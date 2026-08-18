import { ExpenseWithCategory, Category, BudgetWithProgress, CategorySummary, SpendingAnalytics, PaymentMode, DailySpendPoint, PaymentMethodBreakdown } from '@repo/types';
import { getDaysRemainingInMonth } from './date';

/**
 * Computes category breakdown and percentage distribution from expenses
 */
export function calculateCategorySummaries(
  expenses: ExpenseWithCategory[],
  categories: Category[]
): CategorySummary[] {
  const totalSpend = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const categoryMap = new Map<string, { total: number; count: number; name: string; icon: string; color: string }>();

  // Initialize with known categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      total: 0,
      count: 0,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    });
  });

  // Track Uncategorized
  const uncategorizedKey = 'uncategorized';
  categoryMap.set(uncategorizedKey, {
    total: 0,
    count: 0,
    name: 'Uncategorized',
    icon: 'help-circle',
    color: '#94a3b8',
  });

  expenses.forEach((exp) => {
    const catId = exp.category_id && categoryMap.has(exp.category_id) ? exp.category_id : uncategorizedKey;
    const item = categoryMap.get(catId)!;
    item.total += Number(exp.amount);
    item.count += 1;
  });

  const summaries: CategorySummary[] = [];

  categoryMap.forEach((val, key) => {
    if (val.total > 0 || key !== uncategorizedKey) {
      summaries.push({
        category_id: key,
        category_name: val.name,
        category_icon: val.icon,
        category_color: val.color,
        total_amount: val.total,
        transaction_count: val.count,
        percentage: totalSpend > 0 ? Number(((val.total / totalSpend) * 100).toFixed(1)) : 0,
      });
    }
  });

  return summaries.sort((a, b) => b.total_amount - a.total_amount);
}

/**
 * Computes budget progress status, burn rate, and daily allowance
 */
export function calculateBudgetProgress(
  budget: { id: string; user_id: string; category_id: string; monthly_limit: number; month: string; created_at: string },
  spentAmount: number,
  category?: Category
): BudgetWithProgress {
  const limit = Number(budget.monthly_limit);
  const spent = Number(spentAmount);
  const remaining = Math.max(0, limit - spent);
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOver = spent > limit;

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (percentage >= 95 || isOver) {
    status = 'exceeded';
  } else if (percentage >= 75) {
    status = 'warning';
  }

  const daysRemaining = getDaysRemainingInMonth();
  const dailyAllowance = remaining > 0 ? Number((remaining / daysRemaining).toFixed(2)) : 0;

  return {
    ...budget,
    category,
    spent_amount: spent,
    remaining_amount: remaining,
    percentage_used: Number(percentage.toFixed(1)),
    is_over_budget: isOver,
    status,
    daily_allowance_remaining: dailyAllowance,
  };
}

/**
 * Computes comprehensive spending analytics
 */
export function calculateAnalytics(
  expenses: ExpenseWithCategory[],
  categories: Category[],
  previousPeriodExpenses: ExpenseWithCategory[] = []
): SpendingAnalytics {
  const totalSpend = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const prevSpend = previousPeriodExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentageChange =
    prevSpend > 0 ? Number((((totalSpend - prevSpend) / prevSpend) * 100).toFixed(1)) : 0;

  const categorySummaries = calculateCategorySummaries(expenses, categories);
  const highestCategory = categorySummaries.length > 0 ? categorySummaries[0] : null;

  // Group daily
  const dailyMap = new Map<string, number>();
  expenses.forEach((exp) => {
    const day = exp.spent_at.split('T')[0];
    dailyMap.set(day, (dailyMap.get(day) || 0) + Number(exp.amount));
  });

  const sortedDays = Array.from(dailyMap.keys()).sort();
  let accumulated = 0;
  const daily_trends: DailySpendPoint[] = sortedDays.map((date) => {
    const amount = dailyMap.get(date) || 0;
    accumulated += amount;
    return {
      date,
      amount,
      accumulated,
    };
  });

  // Group payment methods
  const paymentMap = new Map<PaymentMode, { total: number; count: number }>();
  expenses.forEach((exp) => {
    const pm = exp.payment_method || 'other';
    const current = paymentMap.get(pm) || { total: 0, count: 0 };
    paymentMap.set(pm, {
      total: current.total + Number(exp.amount),
      count: current.count + 1,
    });
  });

  const payment_methods: PaymentMethodBreakdown[] = Array.from(paymentMap.entries()).map(
    ([method, data]) => ({
      method,
      label: method.replace('_', ' ').toUpperCase(),
      total_amount: data.total,
      count: data.count,
      percentage: totalSpend > 0 ? Number(((data.total / totalSpend) * 100).toFixed(1)) : 0,
    })
  );

  const activeDays = sortedDays.length || 1;
  const averageDailySpend = Number((totalSpend / activeDays).toFixed(2));

  return {
    total_spend: totalSpend,
    previous_period_spend: prevSpend,
    percentage_change: percentageChange,
    transaction_count: expenses.length,
    average_daily_spend: averageDailySpend,
    highest_spending_category: highestCategory,
    categories: categorySummaries,
    daily_trends,
    payment_methods,
  };
}
