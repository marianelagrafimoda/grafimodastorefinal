
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rdpbuaxwyoyvxmdlpayj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGJ1YXh3eW95dnhtZGxwYXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MzU1MzksImV4cCI6MjA1NzQxMTUzOX0.PnFISwrPPGbv3-HGJklgPQMqOytcOoN14nuShGOKFas";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'grafimoda-auth-token',
    }
  }
);

// Set up a listener for auth state changes to help with debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Supabase auth event: ${event}`, session);
});
