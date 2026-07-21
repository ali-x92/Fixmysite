import type { ServerSupabaseClient } from "@/server/db/client";

import type { IssueRepository } from "./issue-repository";
import { requireDatabaseData, throwIfDatabaseError } from "./supabase-repository";

export function createSupabaseIssueRepository(client: ServerSupabaseClient): IssueRepository {
  return {
    async create(values) {
      const { data, error } = await client.from("issues").insert(values).select().single();
      return requireDatabaseData(data, error);
    },
    async findById(id) {
      const { data, error } = await client.from("issues").select().eq("id", id).maybeSingle();
      throwIfDatabaseError(error);
      return data;
    },
    async listByAnalysisId(analysisId) {
      const { data, error } = await client.from("issues").select().eq("analysis_id", analysisId);
      throwIfDatabaseError(error);
      return data ?? [];
    },
    async update(id, values) {
      const { data, error } = await client
        .from("issues")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      return requireDatabaseData(data, error);
    },
    async delete(id) {
      const { error } = await client.from("issues").delete().eq("id", id);
      throwIfDatabaseError(error);
    },
  };
}
