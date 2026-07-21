import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Code2, Globe, Loader2, Sparkles, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { SeverityBadge } from "@/components/severity-badge";
import type { AiFixResponse } from "@/features/analysis/ai-contracts";
import type { ReportResponse } from "@/features/analysis/contracts";
import type { HistoryResponse } from "@/features/history/contracts";
import { generateFix, getHistory, getReport } from "@/lib/api-client";
import { useToast } from "@/lib/toast";

export const Route = createFileRoute("/fixes")({
  head: () => ({ meta: [{ title: "AI Fixes - FixMySite AI" }] }),
  component: FixesPage,
});

function FixesPage() {
  const { notify } = useToast();
  const [entries, setEntries] = useState<HistoryResponse["entries"]>([]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [fix, setFix] = useState<AiFixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    getHistory()
      .then(({ entries: nextEntries }) => setEntries(nextEntries))
      .catch((error) =>
        notify(error instanceof Error ? error.message : "Unable to load fixes.", "error"),
      )
      .finally(() => setLoading(false));
  }, [notify]);

  const openReport = async (analysisId: string) => {
    setLoading(true);
    try {
      setReport(await getReport(analysisId));
      setFix(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to load this analysis.", "error");
    } finally {
      setLoading(false);
    }
  };

  const createFix = async (issueId: string) => {
    setGeneratingId(issueId);
    try {
      setFix(await generateFix(issueId));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to generate a fix.", "error");
    } finally {
      setGeneratingId(null);
    }
  };

  if (fix) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10">
          <button
            onClick={() => setFix(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All issues
          </button>
          <PageHeader
            eyebrow="AI-generated fix"
            title={fix.fix.problem}
            description={fix.fix.explanation}
          />
          <div className="mt-6 card-surface p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-heading">
              <Code2 className="h-4 w-4 text-primary" /> Suggested code
            </div>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-[oklch(0.16_0.02_260)] p-5 text-sm leading-6 text-white">
              <code>{fix.fix.suggestedCode}</code>
            </pre>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard title="Implementation notes" body={fix.fix.implementationNotes} />
            <InfoCard title="Expected result" body={fix.fix.expectedResult} />
            <InfoCard title="Testing advice" body={fix.fix.testingAdvice} />
            <InfoCard title="Rollback notes" body={fix.fix.rollbackNotes} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (report) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10">
          <button
            onClick={() => setReport(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All analyses
          </button>
          <PageHeader
            eyebrow="AI Fixes"
            title="Choose an issue"
            description="Generate a focused, AI-assisted fix from a real issue in this saved analysis."
          />
          <div className="mt-8 space-y-3">
            {report.issues.map((issue) => (
              <FixIssueRow
                key={issue.id}
                issue={issue}
                generatingId={generatingId}
                onCreateFix={createFix}
              />
            ))}
            {report.issues.length === 0 && (
              <div className="card-surface p-8 text-center text-sm text-muted-foreground">
                This analysis has no issues to generate fixes for.
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl animate-in-up px-4 py-8 md:px-8 md:py-10">
        <PageHeader
          eyebrow="AI Fixes"
          title="Fix real website issues"
          description="Select one of your saved analyses to generate a practical fix for an identified issue."
        />
        {loading ? (
          <div className="mt-8 card-surface p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
            Loading analyses...
          </div>
        ) : entries.length === 0 ? (
          <div className="mt-8 card-surface p-10 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <h2 className="mt-4 text-heading text-lg font-semibold">No analyses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run your first website analysis to generate fixes from real findings.
            </p>
            <Link
              to="/analyze"
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Analyze a website
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {entries.map(({ analysis, site }) => (
              <button
                key={analysis.id}
                onClick={() => openReport(analysis.id)}
                className="card-surface flex w-full items-center gap-4 p-5 text-left hover:border-primary/30 hover:shadow-soft"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-heading text-sm font-semibold">{site.domain}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()} · {analysis.status}
                  </div>
                </div>
                <span className="text-heading text-lg font-semibold">
                  {analysis.overall_score ?? "-"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="card-surface p-5">
      <h2 className="text-heading text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </section>
  );
}

function FixIssueRow({
  issue,
  generatingId,
  onCreateFix,
}: {
  issue: ReportResponse["issues"][number];
  generatingId: string | null;
  onCreateFix: (issueId: string) => Promise<void>;
}) {
  const hasGeneratedFix = Boolean(issue.ai_explanation && "fix" in issue.ai_explanation);
  const isGenerating = generatingId === issue.id;

  return (
    <div className="card-surface flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={issue.severity} />
          <span className="text-xs text-muted-foreground">{issue.category}</span>
          {hasGeneratedFix && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              Generated
            </span>
          )}
        </div>
        <h2 className="mt-2 text-heading text-base font-semibold">{issue.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{issue.recommendation}</p>
      </div>
      <button
        onClick={() => onCreateFix(issue.id)}
        disabled={generatingId !== null}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-70"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {isGenerating ? "Opening..." : hasGeneratedFix ? "View generated code" : "Generate fix"}
      </button>
    </div>
  );
}
