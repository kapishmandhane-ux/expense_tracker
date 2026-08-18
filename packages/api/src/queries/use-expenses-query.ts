import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, ExpenseWithCategory, ExpenseQueryFilters } from '@repo/types';
import { CreateExpenseInput, UpdateExpenseInput } from '@repo/validators';

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

export function useExpenseMutations(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: async (newExpense: CreateExpenseInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userData.user.id,
          amount: newExpense.amount,
          category_id: newExpense.category_id || null,
          payment_method: newExpense.payment_method || 'upi',
          note: newExpense.note || null,
          spent_at: typeof newExpense.spent_at === 'string' ? newExpense.spent_at : newExpense.spent_at.toISOString(),
          receipt_storage_path: newExpense.receipt_storage_path || null,
        })
        .select(`*, category:categories(*)`)
        .single();

      if (error) throw error;
      return data as unknown as ExpenseWithCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (updated: UpdateExpenseInput) => {
      const { id, ...rest } = updated;
      const payload: Record<string, unknown> = { ...rest };
      if (rest.spent_at) {
        payload.spent_at = typeof rest.spent_at === 'string' ? rest.spent_at : rest.spent_at.toISOString();
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .select(`*, category:categories(*)`)
        .single();

      if (error) throw error;
      return data as unknown as ExpenseWithCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  return {
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
