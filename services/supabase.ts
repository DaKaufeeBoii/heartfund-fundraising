
import { createClient } from '@supabase/supabase-js';

// These variables are typically injected via your build tool or environment.
// For this environment, we assume they are accessible via process.env.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
