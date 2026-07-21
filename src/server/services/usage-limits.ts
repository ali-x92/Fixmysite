import type { ServerSupabaseClient } from "@/server/db/client";

export const MAX_SITES_PER_USER = 3;

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageLimitError";
  }
}

export async function consumeAiFixCredit(client: ServerSupabaseClient): Promise<void> {
  const { data, error } = await client.rpc("consume_ai_fix_credit");
  if (error) throw error;
  if (!data) throw new UsageLimitError("You have used all 5 AI fix credits.");
}
