import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Category } from '@repo/types';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategoriesQuery(supabase: SupabaseClient<Database, any, any>) {
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
