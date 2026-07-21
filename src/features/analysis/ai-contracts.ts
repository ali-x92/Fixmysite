import { z } from "zod";

import { analysisIdSchema } from "./contracts";

const shortText = z.string().trim().min(1).max(1_200);

export const aiPriorityPlanItemSchema = z.object({
  priority: z.number().int().min(1).max(5),
  title: shortText,
  reason: shortText,
  estimatedImpact: shortText,
  difficulty: z.enum(["low", "medium", "high"]),
  expectedImprovement: shortText,
});

export const aiIssueExplanationSchema = z.object({
  issueId: z.string().uuid(),
  explanation: shortText,
  whyItMatters: shortText,
  whoItAffects: shortText,
  howToFix: shortText,
  businessImpact: shortText,
});

export const aiRecommendationSchema = z.object({
  title: shortText,
  description: shortText,
  expectedImpact: shortText,
});

export const aiGeneratedContentSchema = z.object({
  executiveSummary: z.string().trim().min(1).max(1_800),
  priorityPlan: z.array(aiPriorityPlanItemSchema).min(1).max(5),
  issueExplanations: z.array(aiIssueExplanationSchema).max(100),
  recommendations: z.array(aiRecommendationSchema).min(1).max(5),
});

export const aiSummarySchema = aiGeneratedContentSchema.extend({
  source: z.enum(["ai", "fallback"]),
  promptVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
});

export const summaryRequestSchema = z.object({ analysisId: analysisIdSchema });
export const summaryParamsSchema = z.object({ analysisId: analysisIdSchema });
export const summaryResponseSchema = z.object({
  analysisId: analysisIdSchema,
  summary: aiSummarySchema,
});

export const aiFixContentSchema = z.object({
  problem: shortText,
  explanation: shortText,
  suggestedCode: z.string().trim().min(1).max(4_000),
  implementationNotes: shortText,
  expectedResult: shortText,
  testingAdvice: shortText,
  rollbackNotes: shortText,
});

export const aiFixResponseSchema = z.object({
  issueId: z.string().uuid(),
  source: z.enum(["ai", "fallback"]),
  promptVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
  fix: aiFixContentSchema,
});

export type AiGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;
export type AiSummary = z.infer<typeof aiSummarySchema>;
export type AiFixContent = z.infer<typeof aiFixContentSchema>;
export type AiFixResponse = z.infer<typeof aiFixResponseSchema>;
