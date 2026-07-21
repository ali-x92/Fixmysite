import type { ServerSupabaseClient } from "@/server/db/client";

import type { AnalysisRepository } from "./analysis-repository";
import { requireDatabaseData, throwIfDatabaseError } from "./supabase-repository";

export function createSupabaseAnalysisRepository(client: ServerSupabaseClient): AnalysisRepository {
  return {
    async findById(id) {
      const { data, error } = await client.from("analyses").select().eq("id", id).maybeSingle();
      throwIfDatabaseError(error);
      return data;
    },
    async create(values) {
      const { data, error } = await client.from("analyses").insert(values).select().single();
      return requireDatabaseData(data, error);
    },
    async listBySiteIds(siteIds) {
      if (siteIds.length === 0) return [];
      const { data, error } = await client
        .from("analyses")
        .select()
        .in("site_id", siteIds)
        .order("created_at", { ascending: false });
      throwIfDatabaseError(error);
      return data ?? [];
    },
    async update(id, values) {
      const { data, error } = await client
        .from("analyses")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      return requireDatabaseData(data, error);
    },
    async delete(id) {
      const { error } = await client.from("analyses").delete().eq("id", id);
      throwIfDatabaseError(error);
    },
  };
}
