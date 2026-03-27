import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// New browser auth client for App Router components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Backward-compatible singleton for existing API/routes code
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);