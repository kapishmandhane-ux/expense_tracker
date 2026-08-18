import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Budget } from '@repo/types';
import { BudgetInput, UpdateBudgetInput } from '@repo/validators';

export const BUDGETS_QUERY_KEY = ['budgets'] as const;

export function useBudgetsQuery(
  supabase: SupabaseClient<Database>,
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

export function useBudgetMutations(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  const setBudget = useMutation({
    mutationFn: async (budgetInput: BudgetInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userData.user.id,
            category_id: budgetInput.category_id,
            monthly_limit: budgetInput.monthly_limit,
            month: budgetInput.month,
          },
          { onConflict: 'user_id, category_id, month' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
      if (error) throw error;
      return budgetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });

  return {
    setBudget,
    deleteBudget,
  };
}
