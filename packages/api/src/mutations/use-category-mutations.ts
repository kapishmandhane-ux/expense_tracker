import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Category } from '@repo/types';
import { CreateCategoryInput, UpdateCategoryInput } from '@repo/validators';
import { CATEGORIES_QUERY_KEY } from '../queries/use-categories-query';

export function useCategoryMutations(supabase: SupabaseClient<Database, any, any>) {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (newCategory: CreateCategoryInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userData.user.id,
          name: newCategory.name,
          icon: newCategory.icon || 'tag',
          color: newCategory.color || '#64748b',
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (updated: UpdateCategoryInput) => {
      const { id, ...rest } = updated;
      const { data, error } = await supabase
        .from('categories')
        .update(rest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
