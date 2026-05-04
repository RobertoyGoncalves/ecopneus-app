import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(url?.trim() && anonKey?.trim());
}

let client: SupabaseClient | null = null;

/** Cliente singleton; só válido se `isSupabaseConfigured()`. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured() || !url || !anonKey) {
    throw new Error("Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY");
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
