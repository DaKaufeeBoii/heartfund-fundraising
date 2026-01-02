import { createClient } from '@supabase/supabase-js';

// These variables are typically injected via your build tool or environment.
// For this environment, we assume they are accessible via process.env.
const supabaseUrl = process.env.SUPABASE_URL || 'https://mfnzlmfvqtffzvtlgmaw.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbnpsbWZ2cXRmZnp2dGxnbWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzYwODAsImV4cCI6MjA4MjkxMjA4MH0.cW2acO03_lIx8SL1kVBL4m56J_zlEGekXbavArrspak';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
