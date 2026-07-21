import type { ServerSupabaseClient } from "@/server/db/client";

import type { ProfileRepository } from "./profile-repository";
import { requireDatabaseData, throwIfDatabaseError } from "./supabase-repository";

export function createSupabaseProfileRepository(client: ServerSupabaseClient): ProfileRepository {
  return {
    async findById(id) {
      const { data, error } = await client.from("profiles").select().eq("id", id).maybeSingle();
      throwIfDatabaseError(error);
      return data;
    },
    async upsert(profile) {
      const { data, error } = await client.from("profiles").upsert(profile).select().single();
      return requireDatabaseData(data, error);
    },
    async update(id, values) {
      const { data, error } = await client
        .from("profiles")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      return requireDatabaseData(data, error);
    },
  };
}
