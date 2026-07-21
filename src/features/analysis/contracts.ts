import { z } from "zod";

/** Adds the secure default protocol without changing an explicitly supplied URL. */
export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const analysisStatusSchema = z.enum(["queued", "running", "completed", "failed"]);
export const analysisIdSchema = z.string().uuid();
export const siteUrlSchema = z
  .string()
  .trim()
  .transform(normalizeWebsiteUrl)
  .pipe(z.string().url())
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "URL must use HTTP or HTTPS");

export const analyzeRequestSchema = z.object({ url: siteUrlSchema });
export const analyzeResponseSchema = z.object({
  analysisId: analysisIdSchema,
  status: analysisStatusSchema,
  overallScore: z.number().int().min(0).max(100),
  scores: z.object({
    performance: z.number().int(),
    seo: z.number().int(),
    accessibility: z.number().int(),
    security: z.number().int(),
    mobile: z.number().int(),
    ux: z.number().int(),
  }),
});
export const reportParamsSchema = z.object({ id: analysisIdSchema });
export const analysisSchema = z.object({
  id: analysisIdSchema,
  site_id: z.string().uuid(),
  status: analysisStatusSchema,
  overall_score: z.number().int().nullable(),
  seo_score: z.number().int().nullable(),
  performance_score: z.number().int().nullable(),
  accessibility_score: z.number().int().nullable(),
  security_score: z.number().int().nullable(),
  mobile_score: z.number().int().nullable(),
  ux_score: z.number().int().nullable(),
  executive_summary: z.string().nullable(),
  ai_content: z.record(z.unknown()).nullable(),
  ai_generated_at: z.string().nullable(),
  ai_prompt_version: z.string().nullable(),
  created_at: z.string(),
});
export const issueSchema = z.object({
  id: z.string().uuid(),
  analysis_id: analysisIdSchema,
  category: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  estimated_fix_time: z.string(),
  ai_explanation: z.record(z.unknown()).nullable(),
});
export const recommendationRecordSchema = z.object({
  id: z.string().uuid(),
  analysis_id: analysisIdSchema,
  priority: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  expected_impact: z.string(),
});
export const reportResponseSchema = z.object({
  analysis: analysisSchema,
  site: z.object({
    id: z.string().uuid(),
    url: z.string().url(),
    domain: z.string(),
  }),
  issues: z.array(issueSchema),
  recommendations: z.array(recommendationRecordSchema),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
