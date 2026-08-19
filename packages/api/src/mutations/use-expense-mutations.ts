import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, ExpenseWithCategory } from '@repo/types';
import { CreateExpenseInput, UpdateExpenseInput } from '@repo/validators';
import { EXPENSES_QUERY_KEY } from '../queries/use-expenses-query';

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
    onMutate: async (newExpense: CreateExpenseInput) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_QUERY_KEY });
      const previousExpenses = queryClient.getQueryData<ExpenseWithCategory[]>(EXPENSES_QUERY_KEY);

      const optimisticItem: ExpenseWithCategory = {
        id: 'temp-' + Date.now(),
        user_id: 'current-user',
        amount: newExpense.amount,
        category_id: newExpense.category_id || null,
        payment_method: newExpense.payment_method || 'upi',
        note: newExpense.note || null,
        spent_at: typeof newExpense.spent_at === 'string' ? newExpense.spent_at : newExpense.spent_at.toISOString(),
        receipt_storage_path: newExpense.receipt_storage_path || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null,
      };

      queryClient.setQueriesData<ExpenseWithCategory[]>({ queryKey: EXPENSES_QUERY_KEY }, (old: ExpenseWithCategory[] | undefined) => {
        return old ? [optimisticItem, ...old] : [optimisticItem];
      });

      return { previousExpenses };
    },
    onError: (_err: unknown, _newExpense: CreateExpenseInput, context: { previousExpenses?: ExpenseWithCategory[] } | undefined) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(EXPENSES_QUERY_KEY, context.previousExpenses);
      }
    },
    onSettled: () => {
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
    onMutate: async (updated: UpdateExpenseInput) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_QUERY_KEY });
      const previousExpenses = queryClient.getQueryData<ExpenseWithCategory[]>(EXPENSES_QUERY_KEY);

      queryClient.setQueriesData<ExpenseWithCategory[]>({ queryKey: EXPENSES_QUERY_KEY }, (old: ExpenseWithCategory[] | undefined) => {
        if (!old) return [];
        return old.map((item: ExpenseWithCategory) =>
          item.id === updated.id
            ? ({
                ...item,
                ...updated,
                spent_at:
                  typeof updated.spent_at === 'string'
                    ? updated.spent_at
                    : updated.spent_at
                    ? updated.spent_at.toISOString()
                    : item.spent_at,
              } as ExpenseWithCategory)
            : item
        );
      });

      return { previousExpenses };
    },
    onError: (_err: unknown, _updated: UpdateExpenseInput, context: { previousExpenses?: ExpenseWithCategory[] } | undefined) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(EXPENSES_QUERY_KEY, context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      return expenseId;
    },
    onMutate: async (expenseId: string) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_QUERY_KEY });
      const previousExpenses = queryClient.getQueryData<ExpenseWithCategory[]>(EXPENSES_QUERY_KEY);

      queryClient.setQueriesData<ExpenseWithCategory[]>({ queryKey: EXPENSES_QUERY_KEY }, (old: ExpenseWithCategory[] | undefined) => {
        return old ? old.filter((item: ExpenseWithCategory) => item.id !== expenseId) : [];
      });

      return { previousExpenses };
    },
    onError: (_err: unknown, _id: string, context: { previousExpenses?: ExpenseWithCategory[] } | undefined) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(EXPENSES_QUERY_KEY, context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const bulkDeleteExpenses = useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { error } = await supabase.from('expenses').delete().in('id', expenseIds);
      if (error) throw error;
      return expenseIds;
    },
    onMutate: async (expenseIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_QUERY_KEY });
      const previousExpenses = queryClient.getQueryData<ExpenseWithCategory[]>(EXPENSES_QUERY_KEY);

      const idSet = new Set(expenseIds);
      queryClient.setQueriesData<ExpenseWithCategory[]>({ queryKey: EXPENSES_QUERY_KEY }, (old: ExpenseWithCategory[] | undefined) => {
        return old ? old.filter((item: ExpenseWithCategory) => !idSet.has(item.id)) : [];
      });

      return { previousExpenses };
    },
    onError: (_err: unknown, _ids: string[], context: { previousExpenses?: ExpenseWithCategory[] } | undefined) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(EXPENSES_QUERY_KEY, context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  return {
    createExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
  };
}
