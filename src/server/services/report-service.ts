import type { ReportResponse } from "@/features/analysis/contracts";

import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { IssueRepository } from "../repositories/issue-repository";
import type { RecommendationRepository } from "../repositories/recommendation-repository";
import type { SiteRepository } from "../repositories/site-repository";

export interface ReportService {
  getReport(userId: string, analysisId: string): Promise<ReportResponse | null>;
}

export function createReportService(dependencies: {
  analyses: AnalysisRepository;
  sites: SiteRepository;
  issues: IssueRepository;
  recommendations: RecommendationRepository;
}): ReportService {
  return {
    async getReport(userId, analysisId) {
      const analysis = await dependencies.analyses.findById(analysisId);
      if (!analysis) return null;
      const site = await dependencies.sites.findById(analysis.site_id);
      if (!site || site.user_id !== userId) return null;
      const [issues, recommendations] = await Promise.all([
        dependencies.issues.listByAnalysisId(analysis.id),
        dependencies.recommendations.listByAnalysisId(analysis.id),
      ]);
      return { analysis, site, issues, recommendations };
    },
  };
}
