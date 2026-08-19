import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, ExpenseWithCategory, ExpenseQueryFilters } from '@repo/types';

export const EXPENSES_QUERY_KEY = ['expenses'] as const;

export function useExpensesQuery(
  supabase: SupabaseClient<Database>,
  filters?: ExpenseQueryFilters
) {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, filters],
    queryFn: async (): Promise<ExpenseWithCategory[]> => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*)
        `)
        .order('spent_at', { ascending: false });

      if (filters?.date_range?.start_date) {
        query = query.gte('spent_at', filters.date_range.start_date);
      }
      if (filters?.date_range?.end_date) {
        query = query.lte('spent_at', filters.date_range.end_date);
      }
      if (filters?.category_ids && filters.category_ids.length > 0) {
        query = query.in('category_id', filters.category_ids);
      }
      if (filters?.payment_methods && filters.payment_methods.length > 0) {
        query = query.in('payment_method', filters.payment_methods);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as ExpenseWithCategory[]) || [];
    },
  });
}
