import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. API DB calls will fail.');
}

export const supabaseAdmin = createClient(url || '', serviceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
