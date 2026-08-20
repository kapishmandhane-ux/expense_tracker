import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Budget } from '@repo/types';

export const BUDGETS_QUERY_KEY = ['budgets'] as const;

export function useBudgetsQuery(
  supabase: SupabaseClient<Database, any, any>,
  month?: string
) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, month],
    queryFn: async (): Promise<Budget[]> => {
      let query = supabase.from('budgets').select('*');
      if (month) {
        query = query.eq('month', month);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
