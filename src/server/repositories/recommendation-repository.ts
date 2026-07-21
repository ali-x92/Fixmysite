import type { Database } from "@/server/db/database.types";

export type RecommendationRecord = Database["public"]["Tables"]["recommendations"]["Row"];
export type RecommendationInsert = Database["public"]["Tables"]["recommendations"]["Insert"];
export type RecommendationUpdate = Database["public"]["Tables"]["recommendations"]["Update"];

export interface RecommendationRepository {
  create(values: RecommendationInsert): Promise<RecommendationRecord>;
  listByAnalysisId(analysisId: string): Promise<RecommendationRecord[]>;
  update(id: string, values: RecommendationUpdate): Promise<RecommendationRecord>;
  delete(id: string): Promise<void>;
}
