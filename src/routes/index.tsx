import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreRing } from "@/components/score-ring";
import { SeverityBadge } from "@/components/severity-badge";
import type { AiSummary } from "@/features/analysis/ai-contracts";
import { normalizeWebsiteUrl, type ReportResponse } from "@/features/analysis/contracts";
import type { HistoryResponse } from "@/features/history/contracts";
import { getHistory, getReport, getSummary } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const [history, setHistory] = useState<HistoryResponse["entries"]>([]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistory()
      .then(async ({ entries }) => {
        setHistory(entries);
        const latest = entries[0];
        if (!latest) return;
        const [nextReport, nextSummary] = await Promise.all([
          getReport(latest.analysis.id),
          getSummary(latest.analysis.id),
        ]);
        setReport(nextReport);
        setSummary(nextSummary);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Your workspace could not be loaded."),
      );
  }, []);

  if (!history.length && !error) return <Onboarding />;
  const analysis = report?.analysis ?? history[0]?.analysis;
  const latestSite = history[0]?.site;
  const categories = [
    ["Performance", analysis?.performance_score],
    ["SEO", analysis?.seo_score],
    ["Accessibility", analysis?.accessibility_score],
    ["Security", analysis?.security_score],
  ];
  const criticalIssues =
    report?.issues
      .filter((issue) => issue.severity === "critical" || issue.severity === "high")
      .slice(0, 4) ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up">
        <PageHeader
          eyebrow="Workspace health"
          title="Your latest website analysis"
          description={
            latestSite
              ? `Review ${latestSite.domain}, prioritize the most important issues, and keep improvements moving.`
              : "Loading your latest analysis…"
          }
          actions={
            <Link to="/analyze" className="btn-primary">
              <Sparkles className="h-4 w-4" /> Analyze a website
            </Link>
          }
        />
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
          >
            {error}
          </div>
        )}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card-surface p-7 lg:col-span-2 shadow-elevated">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <ScoreRing value={analysis?.overall_score ?? 0} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" /> Latest audit
                  </span>
                  <span className="font-medium text-foreground">
                    {latestSite?.domain ?? "Preparing workspace"}
                  </span>
                </div>
                <h2 className="text-heading mt-3 text-2xl font-semibold leading-tight">
                  {analysis?.overall_score === null
                    ? "Analysis in progress"
                    : "Health score at a glance"}
                </h2>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  {summary?.executiveSummary ??
                    "Your deterministic audit results will appear here as soon as the analysis is complete."}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Metric label="Open issues" value={String(report?.issues.length ?? 0)} />
                  <Metric label="Priority issues" value={String(criticalIssues.length)} />
                  <Metric
                    label="Latest score"
                    value={
                      analysis?.overall_score === null || analysis?.overall_score === undefined
                        ? "—"
                        : `${analysis.overall_score}/100`
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card-surface p-7 shadow-elevated">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-heading text-sm font-semibold">AI action plan</h3>
            </div>
            <div className="mt-4 space-y-2">
              {summary?.priorityPlan.slice(0, 3).map((item) => (
                <div
                  key={item.priority}
                  className="flex items-start gap-2.5 rounded-lg p-2 text-sm"
                >
                  <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{item.title}</span>
                </div>
              )) ?? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  AI priorities are generated when the latest audit is complete.
                </p>
              )}
            </div>
            {analysis && (
              <Link
                to="/reports/$id"
                params={{ id: analysis.id }}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Open full report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-heading text-lg font-semibold">Category scores</h2>
            <Link
              to="/reports"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              View report history
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(([name, score]) => (
              <div key={name} className="card-surface p-5">
                <div className="flex items-center justify-between">
                  <span className="text-heading text-sm font-semibold">{name}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-heading mt-3 text-3xl font-semibold tabular-nums">
                  {typeof score === "number" ? score : "—"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Latest homepage audit</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="card-surface lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-heading text-sm font-semibold">Recent analyses</h3>
              <Link to="/history" className="text-xs font-semibold text-primary">
                See history
              </Link>
            </div>
            <div className="divide-y divide-border">
              {history.slice(0, 5).map(({ analysis: item, site }) => (
                <Link
                  key={item.id}
                  to="/reports/$id"
                  params={{ id: item.id }}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {site.domain}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-heading text-lg font-semibold tabular-nums">
                    {item.overall_score ?? "—"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="card-surface p-6">
            <h3 className="text-heading text-sm font-semibold">Priority issues</h3>
            <div className="mt-4 space-y-3">
              {criticalIssues.length ? (
                criticalIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    to="/issues/$id"
                    params={{ id: issue.id }}
                    className="block rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-surface"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-medium text-foreground">
                        {issue.title}
                      </span>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                    <div className="mt-1 text-xs capitalize text-muted-foreground">
                      {issue.category}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No priority issues in the latest report.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-heading mt-1.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
function Onboarding() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const startAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      if (!data.session) throw new Error("Please sign in before starting an analysis.");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ url: normalizeWebsiteUrl(url) }),
      });
      const payload = (await response.json()) as {
        analysisId?: string;
        message?: string;
        details?: string;
      };
      if (!response.ok || !payload.analysisId) {
        throw new Error(payload.details ?? payload.message ?? "Unable to analyze this website.");
      }
      navigate({ to: "/reports/$id", params: { id: payload.analysisId } });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to analyze this website.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20 animate-in-up">
        <div className="card-surface overflow-hidden p-8 text-center shadow-elevated sm:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="mt-6 text-sm font-semibold text-primary">Welcome to FixMySite AI</p>
          <h1 className="text-heading mt-2 text-3xl font-semibold sm:text-4xl">
            Analyze your first website in under 60 seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Get a clear health score, accessibility and security findings, and practical AI-guided
            next steps from one homepage audit.
          </p>
          <form
            onSubmit={startAnalysis}
            className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              required
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-11 shrink-0 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Analyzing..." : "Analyze website"}
            </button>
          </form>
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            <Highlight icon={Zap} title="Performance" text="Identify the biggest opportunities." />
            <Highlight
              icon={ShieldCheck}
              title="Accessibility & security"
              text="Surface issues that affect trust."
            />
            <Highlight
              icon={AlertTriangle}
              title="AI recommendations"
              text="Turn findings into an action plan."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
function Highlight({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-heading mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
