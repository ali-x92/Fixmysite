import {
  aiSummarySchema,
  type AiGeneratedContent,
  type AiSummary,
} from "@/features/analysis/ai-contracts";
import type { AnalysisRepository } from "@/server/repositories/analysis-repository";
import type { IssueRepository } from "@/server/repositories/issue-repository";
import type { RecommendationRepository } from "@/server/repositories/recommendation-repository";
import type { SiteRepository } from "@/server/repositories/site-repository";

import { createGroqService, type AiService } from "../ai/openai-service";
import { AI_PROMPT_VERSION, type AiAuditInput } from "../ai/prompts";
import type { ReportService } from "./report-service";

export interface AiSummaryService {
  generate(userId: string, analysisId: string): Promise<AiSummary | null>;
  getCached(userId: string, analysisId: string): Promise<AiSummary | null>;
}

export function createAiSummaryService(dependencies: {
  analyses: AnalysisRepository;
  issues: IssueRepository;
  recommendations: RecommendationRepository;
  sites: SiteRepository;
  report: ReportService;
  ai?: AiService | null;
}): AiSummaryService {
  const ai = dependencies.ai ?? createGroqService();
  return {
    async getCached(userId, analysisId) {
      const report = await dependencies.report.getReport(userId, analysisId);
      if (!report) return null;
      return parseCachedSummary(report.analysis.ai_content);
    },
    async generate(userId, analysisId) {
      const report = await dependencies.report.getReport(userId, analysisId);
      if (!report) return null;

      const cached = parseCachedSummary(report.analysis.ai_content);
      if (cached) return cached;

      const site = await dependencies.sites.findById(report.analysis.site_id);
      if (!site || site.user_id !== userId) return null;
      const input = createAuditInput(site.url, report);

      let content: AiGeneratedContent;
      let source: AiSummary["source"] = "ai";
      try {
        if (!ai) throw new Error("Groq is not configured");
        content = await ai.generateSummary(input);
      } catch {
        source = "fallback";
        content = createFallbackSummary(input);
      }

      const summary = aiSummarySchema.parse({
        ...content,
        source,
        promptVersion: AI_PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
      });
      await dependencies.analyses.update(analysisId, {
        executive_summary: summary.executiveSummary,
        ai_content: summary,
        ai_generated_at: summary.generatedAt,
        ai_prompt_version: AI_PROMPT_VERSION,
      });
      await Promise.all(
        summary.issueExplanations.map((explanation) =>
          dependencies.issues.update(explanation.issueId, { ai_explanation: explanation }),
        ),
      );
      return summary;
    },
  };
}

function parseCachedSummary(value: Record<string, unknown> | null): AiSummary | null {
  const result = aiSummarySchema.safeParse(value);
  return result.success ? result.data : null;
}

function createAuditInput(
  website: string,
  report: Awaited<ReturnType<ReportService["getReport"]>> extends infer TResult
    ? Exclude<TResult, null>
    : never,
): AiAuditInput {
  const issues = report.issues.slice(0, 100).map((issue) => ({
    id: issue.id,
    category: issue.category,
    severity: issue.severity,
    title: issue.title,
    description: issue.description,
    recommendation: issue.recommendation,
    estimatedFixTime: issue.estimated_fix_time,
  }));
  return {
    website,
    scores: {
      overall: report.analysis.overall_score,
      performance: report.analysis.performance_score,
      seo: report.analysis.seo_score,
      accessibility: report.analysis.accessibility_score,
      security: report.analysis.security_score,
      mobile: report.analysis.mobile_score,
      ux: report.analysis.ux_score,
    },
    issueCount: report.issues.length,
    criticalIssueCount: report.issues.filter((issue) => issue.severity === "critical").length,
    issues,
    recommendations: report.recommendations.slice(0, 5).map((recommendation) => ({
      title: recommendation.title,
      description: recommendation.description,
      expectedImpact: recommendation.expected_impact,
    })),
  };
}

function createFallbackSummary(input: AiAuditInput): AiGeneratedContent {
  const issueExplanations = input.issues.map((issue) => ({
    issueId: issue.id,
    explanation: issue.description,
    whyItMatters: `This ${issue.category.toLowerCase()} issue can reduce the quality of the visitor experience.`,
    whoItAffects:
      "Visitors using the affected page, including customers and search engines where relevant.",
    howToFix: issue.recommendation,
    businessImpact: "Resolving it can reduce friction and improve confidence in the site.",
  }));
  const actionIssues = input.issues.slice(0, 5);
  return {
    executiveSummary: `The audit found ${input.issueCount} issue${input.issueCount === 1 ? "" : "s"} across the homepage. Focus first on the highest-severity findings, then validate the changes with a repeat audit. The deterministic scores provide the baseline for improvement.`,
    priorityPlan: actionIssues.map((issue, index) => ({
      priority: index + 1,
      title: issue.title,
      reason: issue.description,
      estimatedImpact:
        issue.severity === "critical" || issue.severity === "high" ? "High" : "Moderate",
      difficulty: "medium" as const,
      expectedImprovement: issue.recommendation,
    })),
    issueExplanations,
    recommendations:
      input.recommendations.length > 0
        ? input.recommendations
        : [
            {
              title: "Resolve the highest-priority issues first",
              description:
                "Implement the deterministic recommendations and validate them on the homepage.",
              expectedImpact: "A clearer path to improving the audited categories.",
            },
          ],
  };
}
