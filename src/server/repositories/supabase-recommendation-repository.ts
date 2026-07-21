import type { ServerSupabaseClient } from "@/server/db/client";

import type { RecommendationRepository } from "./recommendation-repository";
import { requireDatabaseData, throwIfDatabaseError } from "./supabase-repository";

export function createSupabaseRecommendationRepository(
  client: ServerSupabaseClient,
): RecommendationRepository {
  return {
    async create(values) {
      const { data, error } = await client.from("recommendations").insert(values).select().single();
      return requireDatabaseData(data, error);
    },
    async listByAnalysisId(analysisId) {
      const { data, error } = await client
        .from("recommendations")
        .select()
        .eq("analysis_id", analysisId)
        .order("priority");
      throwIfDatabaseError(error);
      return data ?? [];
    },
    async update(id, values) {
      const { data, error } = await client
        .from("recommendations")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      return requireDatabaseData(data, error);
    },
    async delete(id) {
      const { error } = await client.from("recommendations").delete().eq("id", id);
      throwIfDatabaseError(error);
    },
  };
}
