import type { Database } from "@/server/db/database.types";

export type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export interface ProfileRepository {
  findById(id: string): Promise<ProfileRecord | null>;
  upsert(profile: Database["public"]["Tables"]["profiles"]["Insert"]): Promise<ProfileRecord>;
  update(id: string, values: ProfileUpdate): Promise<ProfileRecord>;
}
