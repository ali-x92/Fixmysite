import type { AnalyzeRequest, AnalyzeResponse } from "@/features/analysis/contracts";
import { scanHomepage } from "@/server/scanners/homepage-scanner";
import { submittedUrlSchema } from "@/server/scanners/url";

import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { IssueRepository } from "../repositories/issue-repository";
import type { RecommendationRepository } from "../repositories/recommendation-repository";
import type { SiteRepository } from "../repositories/site-repository";
import { MAX_SITES_PER_USER, UsageLimitError } from "./usage-limits";

export function createAnalysisRunService(dependencies: {
  sites: SiteRepository;
  analyses: AnalysisRepository;
  issues: IssueRepository;
  recommendations: RecommendationRepository;
}) {
  return {
    async run(userId: string, input: AnalyzeRequest): Promise<AnalyzeResponse> {
      const target = submittedUrlSchema.parse(input.url);
      const userSites = await dependencies.sites.listByUserId(userId);
      const existingSite = userSites.find((site) => site.domain === target.domain);
      if (!existingSite && userSites.length >= MAX_SITES_PER_USER) {
        throw new UsageLimitError("You can analyze up to 3 distinct websites with this account.");
      }
      const site =
        existingSite ??
        (await dependencies.sites.create({
          user_id: userId,
          url: target.url,
          domain: target.domain,
        }));
      const analysis = await dependencies.analyses.create({ site_id: site.id, status: "running" });
      try {
        const result = await scanHomepage(target);
        const completed = await dependencies.analyses.update(analysis.id, {
          status: "completed",
          overall_score: result.scores.overall,
          performance_score: result.scores.performance,
          seo_score: result.scores.seo,
          accessibility_score: result.scores.accessibility,
          security_score: result.scores.security,
          mobile_score: result.scores.mobile,
          ux_score: result.scores.ux,
        });
        await Promise.all(
          result.issues.map((issue) =>
            dependencies.issues.create({
              analysis_id: analysis.id,
              category: issue.category,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              recommendation: issue.recommendation,
              estimated_fix_time: issue.estimatedFixTime,
              source: issue.source,
              evidence: issue.evidence,
            }),
          ),
        );
        await Promise.all(
          result.issues.slice(0, 3).map((issue, index) =>
            dependencies.recommendations.create({
              analysis_id: analysis.id,
              priority: index + 1,
              title: issue.title,
              description: issue.recommendation,
              expected_impact: `Improve ${issue.category} score`,
            }),
          ),
        );
        return {
          analysisId: completed.id,
          status: completed.status,
          overallScore: result.scores.overall,
          scores: {
            performance: result.scores.performance,
            seo: result.scores.seo,
            accessibility: result.scores.accessibility,
            security: result.scores.security,
            mobile: result.scores.mobile,
            ux: result.scores.ux,
          },
        };
      } catch (error) {
        // Preserve the scan error if marking the attempt as failed also encounters a database issue.
        await dependencies.analyses
          .update(analysis.id, { status: "failed" })
          .catch(() => undefined);
        throw error;
      }
    },
  };
}
