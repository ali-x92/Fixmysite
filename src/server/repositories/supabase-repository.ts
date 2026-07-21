import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfDatabaseError(error: PostgrestError | null): void {
  if (error) throw error;
}

export function requireDatabaseData<T>(data: T | null, error: PostgrestError | null): T {
  throwIfDatabaseError(error);
  if (data === null) throw new Error("Database returned no data");
  return data;
}
