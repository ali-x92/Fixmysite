import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { SeverityBadge } from "@/components/severity-badge";
import type { ReportResponse } from "@/features/analysis/contracts";
import { getHistory, getReport } from "@/lib/api-client";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "AI Recommendations - FixMySite AI" }] }),
  component: Recommendations,
});

function Recommendations() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(async ({ entries }) =>
        setReports(await Promise.all(entries.map(({ analysis }) => getReport(analysis.id)))),
      )
      .finally(() => setLoading(false));
  }, []);

  const issues = useMemo(
    () =>
      reports
        .flatMap((report) => report.issues.map((issue) => ({ issue, report })))
        .sort((a, b) => severityRank(a.issue.severity) - severityRank(b.issue.severity)),
    [reports],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10">
        <PageHeader
          eyebrow="AI recommendations"
          title="What to do next"
          description="Recommendations from your saved website audits, ordered by severity."
        />
        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading recommendations...</p>
        ) : null}
        {!loading && !issues.length ? (
          <div className="mt-8 card-surface p-8 text-center text-sm text-muted-foreground">
            Run an analysis to see recommendations from real findings.
          </div>
        ) : null}
        <div className="mt-6 space-y-4">
          {issues.map(({ issue, report }, index) => (
            <div key={issue.id} className="card-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <SeverityBadge severity={issue.severity} />
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {issue.estimated_fix_time}
                    </span>
                  </div>
                  <h3 className="text-heading mt-3 text-lg font-semibold">{issue.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {issue.recommendation}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  to="/fixes"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate AI fix
                </Link>
                <Link
                  to="/issues/$id"
                  params={{ id: issue.id }}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface"
                >
                  View details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/reports/$id"
                  params={{ id: report.analysis.id }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Open report
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function severityRank(severity: "critical" | "high" | "medium" | "low" | "info") {
  return { critical: 0, high: 1, medium: 2, low: 3, info: 4 }[severity];
}
