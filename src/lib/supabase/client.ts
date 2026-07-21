import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/server/db/database.types";

const browserEnvironmentSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(1),
});

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const environment = browserEnvironmentSchema.parse({
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
    browserClient = createClient<Database>(environment.url, environment.anonKey);
  }
  return browserClient;
}
