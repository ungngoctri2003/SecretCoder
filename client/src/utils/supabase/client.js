import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Browser Supabase client (Vite + React). Uses @supabase/ssr for consistent auth cookie handling. */
export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);
