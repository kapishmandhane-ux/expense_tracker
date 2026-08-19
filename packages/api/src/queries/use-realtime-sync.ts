import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@repo/types';
import { EXPENSES_QUERY_KEY } from './use-expenses-query';
import { CATEGORIES_QUERY_KEY } from './use-categories-query';
import { BUDGETS_QUERY_KEY } from './use-budgets-query';

export function useRealtimeSync(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to changes on expenses, categories, and budgets
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets' },
        () => {
          queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
