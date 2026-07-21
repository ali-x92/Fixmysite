import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreRing } from "@/components/score-ring";
import { SeverityBadge } from "@/components/severity-badge";
import type { AiSummary } from "@/features/analysis/ai-contracts";
import type { ReportResponse } from "@/features/analysis/contracts";
import { getReport, getSummary } from "@/lib/api-client";
import { useToast } from "@/lib/toast";
import { ArrowRight, Download, Share2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({ meta: [{ title: "Report — FixMySite AI" }] }),
  component: ReportDetail,
});

function categoriesForExport(analysis: ReportResponse["analysis"]): string[] {
  return [
    ["Performance", analysis.performance_score],
    ["SEO", analysis.seo_score],
    ["Accessibility", analysis.accessibility_score],
    ["Security", analysis.security_score],
    ["Mobile", analysis.mobile_score],
    ["User experience", analysis.ux_score],
  ].map(([label, score]) => `${label}: ${typeof score === "number" ? score : "Not available"}`);
}

function ReportDetail() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
  useEffect(() => {
    Promise.all([getReport(id), getSummary(id)])
      .then(([nextReport, nextSummary]) => {
        setReport(nextReport);
        setSummary(nextSummary);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load this report."),
      );
  }, [id]);

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
          <PageHeader
            eyebrow="Report unavailable"
            title="We could not load this analysis"
            description={error}
            actions={
              <Link to="/reports" className="btn-primary">
                Back to reports
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
          <PageHeader
            eyebrow="Loading report"
            title="Preparing your analysis"
            description="Loading saved results and recommendations."
          />
          <div className="mt-8 h-64 rounded-2xl skeleton-shimmer" />
        </div>
      </AppShell>
    );
  }

  const analysis = report?.analysis;
  const issues = report?.issues ?? [];
  const overallScore = analysis?.overall_score ?? 0;
  const severityCounts = issues.reduce(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  );
  const shareReport = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `FixMySite AI report for ${report.site.domain}`,
      text: `Website health score: ${overallScore}/100`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      notify("Report link copied to your clipboard.", "success");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      notify("Unable to share this report. Please copy the address from your browser.", "error");
    }
  };
  const exportReport = () => {
    const lines = [
      "FixMySite AI Website Analysis Report",
      `Website: ${report.site.url}`,
      `Generated: ${new Date(analysis.created_at).toLocaleString()}`,
      `Overall health score: ${overallScore}/100`,
      "",
      "Category scores",
      ...categoriesForExport(analysis),
      "",
      "Issues",
      ...(issues.length
        ? issues.map(
            (issue) =>
              `[${issue.severity.toUpperCase()}] ${issue.title}\n${issue.description}\nRecommendation: ${issue.recommendation}`,
          )
        : ["No issues were found in this audit."]),
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `fixmysite-report-${report.site.domain}-${analysis.id.slice(0, 8)}.txt`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
    notify("Report exported.", "success");
  };
  const categories = [
    ["SEO", analysis?.seo_score],
    ["Accessibility", analysis?.accessibility_score],
    ["Performance", analysis?.performance_score],
    ["Security", analysis?.security_score],
    ["Mobile", analysis?.mobile_score],
    ["User Experience", analysis?.ux_score],
  ].map(([name, rawScore]) => {
    const score = typeof rawScore === "number" ? rawScore : 0;
    return {
      key: name,
      name,
      score,
      status: score >= 80 ? "Good" : "Needs work",
      severity: (score < 60 ? "high" : score < 80 ? "medium" : "low") as "high" | "medium" | "low",
      summary: "Based on the latest completed homepage audit.",
    };
  });
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/reports" className="hover:text-foreground">
            Reports
          </Link>
          <span>/</span>
          <span className="font-mono">{id}</span>
        </div>
        <PageHeader
          eyebrow={`${analysis ? "Latest" : "Loading"} · Full audit`}
          title="Analysis results"
          description={
            analysis
              ? `Completed ${new Date(analysis.created_at).toLocaleString()} · ${issues.length} issues found`
              : "Loading report…"
          }
          actions={
            <>
              <button
                onClick={shareReport}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </>
          }
        />

        {/* Health + AI summary */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card-surface flex flex-col items-center gap-4 p-8 lg:col-span-1">
            <ScoreRing value={overallScore} size={200} />
            <div className="text-center">
              <div className="text-heading text-sm font-semibold">Overall health</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Composite of all 7 categories
              </div>
            </div>
            <div className="grid w-full grid-cols-3 divide-x divide-border border-t border-border pt-4">
              {[
                { l: "Critical", v: severityCounts.critical, t: "text-danger" },
                { l: "High", v: severityCounts.high, t: "text-warning" },
                { l: "Low", v: severityCounts.low, t: "text-primary" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className={`text-heading text-xl font-semibold tabular-nums ${s.t}`}>
                    {s.v}
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface lg:col-span-2 p-8">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-heading text-sm font-semibold">AI executive summary</div>
                <div className="text-xs text-muted-foreground">
                  {summary?.source === "fallback"
                    ? "Deterministic fallback guidance"
                    : "Generated by Groq AI · GPT-OSS 20B"}
                </div>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground">
              {summary?.executiveSummary ??
                analysis.executive_summary ??
                "This audit is ready for review. Prioritize the findings below and run another audit after deploying changes."}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {issues.length
                ? `${severityCounts.critical + severityCounts.high} high-priority issue${severityCounts.critical + severityCounts.high === 1 ? "" : "s"} need attention. Generate a fix from a saved finding when ready.`
                : "No issues were found in this completed audit."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/fixes"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Generate AI fixes <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface"
              >
                View recommendations
              </Link>
            </div>
          </div>
        </div>

        {/* Category cards */}
        <h2 className="text-heading mt-10 mb-4 text-lg font-semibold">Category breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <div
              key={c.key}
              className="card-surface flex flex-col p-5 transition-shadow hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-heading text-sm font-semibold">{c.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.status}</div>
                </div>
                <SeverityBadge severity={c.severity} />
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div
                  className={`text-heading text-4xl font-semibold tabular-nums ${c.score >= 85 ? "text-primary" : c.score >= 70 ? "text-warning" : "text-danger"}`}
                >
                  {c.score}
                </div>
                <div className="pb-1 text-xs text-muted-foreground">/100</div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full ${c.score >= 85 ? "bg-primary" : c.score >= 70 ? "bg-warning" : "bg-danger"}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {c.summary}
              </p>
              {issues[0] && (
                <Link
                  to="/issues/$id"
                  params={{ id: issues[0].id }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  View details <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Issues list */}
        <div className="mt-10 card-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-heading text-sm font-semibold">Top issues</h3>
              <p className="text-xs text-muted-foreground">Sorted by business impact</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {issues.map((i) => (
              <Link
                key={i.id}
                to="/issues/$id"
                params={{ id: i.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-surface"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-xs font-semibold text-muted-foreground">
                  {i.category.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{i.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {i.description}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={i.severity} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
