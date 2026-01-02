import { createClient } from '@supabase/supabase-js';

// These variables are typically injected via your build tool or environment.
// For this environment, we assume they are accessible via process.env.
const supabaseUrl = process.env.SUPABASE_URL || 'https://veeagcrtqjkyznymmznw.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZWFnY3J0cWpreXpueW1tem53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTI4MTAsImV4cCI6MjA4MjgyODgxMH0.g6qxIgl6kk5xpiYiiU1RLCDm98qWEUGUV6g89MyC3jg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);