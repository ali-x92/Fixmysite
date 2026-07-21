import { aiFixResponseSchema, type AiFixResponse } from "@/features/analysis/ai-contracts";
import type { FixRequest, FixResponse } from "@/features/issues/contracts";
import type { IssueRepository } from "@/server/repositories/issue-repository";

import { createGroqService, type AiService } from "../ai/groq-service";
import { AI_PROMPT_VERSION, fallbackFix } from "../ai/prompts";
import type { ReportService } from "./report-service";
import { consumeAiFixCredit } from "./usage-limits";
import type { ServerSupabaseClient } from "@/server/db/client";

export interface FixService {
  requestFix(userId: string, input: FixRequest): Promise<FixResponse | null>;
}

export function createFixService(dependencies: {
  issues: IssueRepository;
  report: ReportService;
  client: ServerSupabaseClient;
  ai?: AiService | null;
}): FixService {
  const ai = dependencies.ai ?? createGroqService();
  return {
    async requestFix(userId, input) {
      const issue = await dependencies.issues.findById(input.issueId);
      if (!issue) return null;
      const report = await dependencies.report.getReport(userId, issue.analysis_id);
      if (!report || !report.issues.some((item) => item.id === issue.id)) return null;

      const cached = parseCachedFix(issue.ai_explanation);
      if (cached) return cached;

      await consumeAiFixCredit(dependencies.client);

      let fix;
      let source: AiFixResponse["source"] = "ai";
      try {
        if (!ai) throw new Error("Groq is not configured");
        fix = await ai.generateFix({
          id: issue.id,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          estimatedFixTime: issue.estimated_fix_time,
        });
      } catch {
        source = "fallback";
        fix = fallbackFix(issue);
      }

      const response = aiFixResponseSchema.parse({
        issueId: issue.id,
        source,
        promptVersion: AI_PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
        fix,
      });
      await dependencies.issues.update(issue.id, {
        ai_explanation: { ...(issue.ai_explanation ?? {}), fix: response },
      });
      return response;
    },
  };
}

function parseCachedFix(value: Record<string, unknown> | null): AiFixResponse | null {
  if (!value || !("fix" in value)) return null;
  const result = aiFixResponseSchema.safeParse(value.fix);
  if (!result.success || result.data.fix.suggestedCode.includes("No project source was provided"))
    return null;
  return result.data;
}
