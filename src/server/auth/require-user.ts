import type { User } from "@supabase/supabase-js";

import { createRequestSupabaseClient, type ServerSupabaseClient } from "@/server/db/client";

import { unauthorizedResponse } from "../validation/response";

export type AuthenticatedRequest = { client: ServerSupabaseClient; user: User };

export async function requireUser(request: Request): Promise<AuthenticatedRequest | Response> {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return unauthorizedResponse();

  const client = createRequestSupabaseClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) return unauthorizedResponse();
  return { client, user: data.user };
}
