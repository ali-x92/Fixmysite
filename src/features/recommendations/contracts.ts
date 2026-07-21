import { z } from "zod";

export const recommendationSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  priority: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  expectedImpact: z.string().min(1),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
