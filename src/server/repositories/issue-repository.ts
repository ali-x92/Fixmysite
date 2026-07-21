import type { Database } from "@/server/db/database.types";

export type IssueRecord = Database["public"]["Tables"]["issues"]["Row"];
export type IssueInsert = Database["public"]["Tables"]["issues"]["Insert"];
export type IssueUpdate = Database["public"]["Tables"]["issues"]["Update"];

export interface IssueRepository {
  create(values: IssueInsert): Promise<IssueRecord>;
  findById(id: string): Promise<IssueRecord | null>;
  listByAnalysisId(analysisId: string): Promise<IssueRecord[]>;
  update(id: string, values: IssueUpdate): Promise<IssueRecord>;
  delete(id: string): Promise<void>;
}
