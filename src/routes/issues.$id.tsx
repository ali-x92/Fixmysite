import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Code2, ExternalLink, Lightbulb, Sparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { SeverityBadge } from "@/components/severity-badge";
import type { ReportResponse } from "@/features/analysis/contracts";
import { getHistory, getReport } from "@/lib/api-client";

export const Route = createFileRoute("/issues/$id")({
  head: () => ({ meta: [{ title: "Issue - FixMySite AI" }] }),
  component: IssueDetail,
});

function IssueDetail() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHistory()
      .then(async ({ entries }) => {
        const reports = await Promise.all(entries.map(({ analysis }) => getReport(analysis.id)));
        const match = reports.find((candidate) =>
          candidate.issues.some((issue) => issue.id === id),
        );
        if (!match) throw new Error("This issue was not found in your saved reports.");
        if (active) setReport(match);
      })
      .catch(
        (cause) =>
          active && setError(cause instanceof Error ? cause.message : "Unable to load this issue."),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error || !report) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
          <PageHeader
            eyebrow={error ? "Issue unavailable" : "Loading issue"}
            title={error ? "We could not load this issue" : "Preparing issue details"}
            description={error ?? "Loading the saved finding and its audited website."}
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

  const issue = report.issues.find((candidate) => candidate.id === id);
  if (!issue) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10">
        <Link
          to="/reports/$id"
          params={{ id: report.analysis.id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to report
        </Link>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold capitalize text-muted-foreground">
              {issue.category}
            </span>
            <span className="text-xs text-muted-foreground">Detected in saved audit</span>
          </div>
          <h1 className="text-heading text-2xl font-semibold sm:text-3xl">{issue.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{issue.description}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <DetailCard icon={Code2} title="Technical explanation" body={issue.description} />
            <DetailCard icon={Lightbulb} title="Recommendation" body={issue.recommendation} />
            <DetailCard
              icon={Sparkles}
              title="Estimated fix time"
              body={issue.estimated_fix_time}
            />
          </div>
          <aside className="space-y-4">
            <div className="card-surface p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-heading text-sm font-semibold">AI can help fix this</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Generate or reopen the saved AI guidance for this real audit finding.
              </p>
              <Link
                to="/fixes"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
              >
                Open AI fixes
              </Link>
            </div>
            <div className="card-surface p-5">
              <div className="text-heading text-sm font-semibold">Affected URL</div>
              <a
                href={report.site.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-primary hover:bg-primary/10"
              >
                <span className="truncate font-mono text-xs">{report.site.url}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                This audit scans the submitted homepage only.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function DetailCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Code2;
  title: string;
  body: string;
}) {
  return (
    <section className="card-surface p-6">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-heading text-sm font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}
