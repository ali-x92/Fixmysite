import type { ServerSupabaseClient } from "@/server/db/client";

import type { SiteRepository } from "./site-repository";
import { requireDatabaseData, throwIfDatabaseError } from "./supabase-repository";

export function createSupabaseSiteRepository(client: ServerSupabaseClient): SiteRepository {
  return {
    async create(values) {
      const { data, error } = await client.from("sites").insert(values).select().single();
      return requireDatabaseData(data, error);
    },
    async findById(id) {
      const { data, error } = await client.from("sites").select().eq("id", id).maybeSingle();
      throwIfDatabaseError(error);
      return data;
    },
    async listByUserId(userId) {
      const { data, error } = await client
        .from("sites")
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      throwIfDatabaseError(error);
      return data ?? [];
    },
    async update(id, values) {
      const { data, error } = await client
        .from("sites")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      return requireDatabaseData(data, error);
    },
    async delete(id) {
      const { error } = await client.from("sites").delete().eq("id", id);
      throwIfDatabaseError(error);
    },
  };
}
