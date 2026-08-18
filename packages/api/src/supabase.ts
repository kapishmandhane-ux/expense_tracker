import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@repo/types';

export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
