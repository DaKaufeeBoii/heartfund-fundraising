
import { createClient } from '@supabase/supabase-js';

// These would normally come from process.env, using placeholders for simulation
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
