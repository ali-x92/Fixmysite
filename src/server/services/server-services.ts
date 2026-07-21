import type { ServerSupabaseClient } from "@/server/db/client";
import { createSupabaseAnalysisRepository } from "@/server/repositories/supabase-analysis-repository";
import { createSupabaseIssueRepository } from "@/server/repositories/supabase-issue-repository";
import { createSupabaseRecommendationRepository } from "@/server/repositories/supabase-recommendation-repository";
import { createSupabaseSiteRepository } from "@/server/repositories/supabase-site-repository";

import { createAnalysisRunService } from "./analysis-run-service";
import { createAiSummaryService } from "./ai-summary-service";
import { createFixService } from "./fix-service";
import { createHistoryService } from "./history-service";
import { createReportService } from "./report-service";

export function createServerServices(client: ServerSupabaseClient) {
  const analyses = createSupabaseAnalysisRepository(client);
  const sites = createSupabaseSiteRepository(client);
  const issues = createSupabaseIssueRepository(client);
  const recommendations = createSupabaseRecommendationRepository(client);
  const report = createReportService({
    analyses,
    sites,
    issues,
    recommendations,
  });
  return {
    history: createHistoryService({ sites, analyses }),
    report,
    analysisRunner: createAnalysisRunService({ analyses, sites, issues, recommendations }),
    summary: createAiSummaryService({ analyses, sites, issues, recommendations, report }),
    fix: createFixService({ issues, report, client }),
  };
}
