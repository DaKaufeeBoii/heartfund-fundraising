
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION INSTRUCTIONS:
 * 1. Go to your Supabase Project Settings > API.
 * 2. Copy the 'Project URL' and 'anon' public key.
 * 3. These are typically handled via environment variables (process.env.SUPABASE_URL).
 *    If you are running this locally, you can replace the empty strings below 
 *    directly with your credentials for testing purposes.
 */

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.warn("Supabase URL is not configured. Database features will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
