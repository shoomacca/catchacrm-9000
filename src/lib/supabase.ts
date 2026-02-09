import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Load from environment variables (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// M02A: Mock-first mode - Supabase is optional until M03 (database integration)
// During UI development, we use CRMContext + localStorage for all CRUD operations
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  // Create Supabase client only if env vars are provided
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  console.log('✓ Supabase client initialized');
} else {
  console.log('ℹ️ Running in mock mode - Supabase not configured');
  console.log('   Using CRMContext + localStorage for all data operations');
  console.log('   (This is expected during M02A - UI completion phase)');
}

export const supabase = supabaseClient as SupabaseClient;
