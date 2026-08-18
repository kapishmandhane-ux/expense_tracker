import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Category } from '@repo/types';
import { CreateCategoryInput, UpdateCategoryInput } from '@repo/validators';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategoriesQuery(supabase: SupabaseClient<Database>) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCategoryMutations(supabase: SupabaseClient<Database>) {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (newCategory: CreateCategoryInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

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
      return data;
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
      return data;
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
