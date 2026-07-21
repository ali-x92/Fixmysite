import { z } from "zod";

import { aiFixResponseSchema } from "@/features/analysis/ai-contracts";

export const issueIdSchema = z.string().uuid();
export const issueSeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export const fixRequestSchema = z.object({ issueId: issueIdSchema });
export const fixResponseSchema = aiFixResponseSchema;

export type FixRequest = z.infer<typeof fixRequestSchema>;
export type FixResponse = z.infer<typeof fixResponseSchema>;
