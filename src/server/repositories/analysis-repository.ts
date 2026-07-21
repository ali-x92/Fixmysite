import type { Database } from "@/server/db/database.types";

export type AnalysisRecord = Database["public"]["Tables"]["analyses"]["Row"];
export type AnalysisInsert = Database["public"]["Tables"]["analyses"]["Insert"];
export type AnalysisUpdate = Database["public"]["Tables"]["analyses"]["Update"];

export interface AnalysisRepository {
  create(values: AnalysisInsert): Promise<AnalysisRecord>;
  findById(id: string): Promise<AnalysisRecord | null>;
  listBySiteIds(siteIds: string[]): Promise<AnalysisRecord[]>;
  update(id: string, values: AnalysisUpdate): Promise<AnalysisRecord>;
  delete(id: string): Promise<void>;
}
