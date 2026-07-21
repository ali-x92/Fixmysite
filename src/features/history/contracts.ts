import { z } from "zod";

import { analysisIdSchema, analysisSchema } from "../analysis/contracts";

export const historyEntrySchema = z.object({
  analysis: analysisSchema,
  site: z.object({ id: z.string().uuid(), url: z.string().url(), domain: z.string() }),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const historyResponseSchema = z.object({
  entries: z.array(historyEntrySchema),
});
export const deleteHistoryParamsSchema = z.object({ id: analysisIdSchema });

export type HistoryResponse = z.infer<typeof historyResponseSchema>;
