import type { HistoryResponse } from "@/features/history/contracts";
import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { SiteRepository } from "../repositories/site-repository";

export interface HistoryService {
  getHistory(userId: string): Promise<HistoryResponse>;
  deleteAnalysis(userId: string, analysisId: string): Promise<boolean>;
}

export function createHistoryService(dependencies: {
  sites: SiteRepository;
  analyses: AnalysisRepository;
}): HistoryService {
  return {
    async getHistory(userId) {
      const sites = await dependencies.sites.listByUserId(userId);
      const siteById = new Map(sites.map((site) => [site.id, site]));
      const analyses = await dependencies.analyses.listBySiteIds(sites.map((site) => site.id));
      return {
        entries: analyses.flatMap((analysis) => {
          const site = siteById.get(analysis.site_id);
          return site
            ? [{ analysis, site: { id: site.id, url: site.url, domain: site.domain } }]
            : [];
        }),
      };
    },
    async deleteAnalysis(userId, analysisId) {
      const analysis = await dependencies.analyses.findById(analysisId);
      if (!analysis) return false;
      const site = await dependencies.sites.findById(analysis.site_id);
      if (!site || site.user_id !== userId) return false;
      await dependencies.analyses.delete(analysisId);
      return true;
    },
  };
}
