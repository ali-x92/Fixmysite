import type { Database } from "@/server/db/database.types";

export type SiteRecord = Database["public"]["Tables"]["sites"]["Row"];
export type SiteInsert = Database["public"]["Tables"]["sites"]["Insert"];
export type SiteUpdate = Database["public"]["Tables"]["sites"]["Update"];

export interface SiteRepository {
  create(values: SiteInsert): Promise<SiteRecord>;
  findById(id: string): Promise<SiteRecord | null>;
  listByUserId(userId: string): Promise<SiteRecord[]>;
  update(id: string, values: SiteUpdate): Promise<SiteRecord>;
  delete(id: string): Promise<void>;
}
