import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getServerEnvironment } from "./env";

export type ServerSupabaseClient = SupabaseClient<Database>;

export function createServerSupabaseClient(): ServerSupabaseClient {
  const environment = getServerEnvironment();
  return createClient<Database>(
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY ?? environment.SUPABASE_ANON_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}

export function createRequestSupabaseClient(accessToken: string): ServerSupabaseClient {
  const environment = getServerEnvironment();
  return createClient<Database>(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
