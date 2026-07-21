import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Globe, Sparkles, Loader2, ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { getHistory } from "@/lib/api-client";
import type { HistoryResponse } from "@/features/history/contracts";
import { normalizeWebsiteUrl } from "@/features/analysis/contracts";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "Analyze — FixMySite AI" }] }),
  component: AnalyzePage,
});

const examples = ["stripe.com", "linear.app", "vercel.com", "notion.so"];

function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<HistoryResponse["entries"]>([]);
  const navigate = useNavigate();
  const { notify } = useToast();

  useEffect(() => {
    getHistory()
      .then(({ entries }) => setRecent(entries.slice(0, 4)))
      .catch(() => setRecent([]));
  }, []);

  const start = async () => {
    if (!url) return;
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
      if (!response.ok || !payload.analysisId)
        throw new Error(payload.details ?? payload.message ?? "Unable to analyze this website.");
      navigate({ to: "/reports/$id", params: { id: payload.analysisId } });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to analyze this website.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16 animate-in-up">
        <PageHeader
          eyebrow="New analysis"
          title="Analyze any website in seconds"
          description="Paste a URL and our AI will audit SEO, performance, accessibility, security, UX and mobile — then explain every issue in plain English."
        />

        <div className="mt-10 card-surface p-6 md:p-8 shadow-elevated">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Website URL
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                inputMode="url"
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="https://website-to-analyze.com"
                className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-4 text-base font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-soft focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <button
              onClick={start}
              disabled={loading}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Analyzing…" : "Analyze website"}
            </button>
          </div>

          {loading && (
            <div className="mt-6 space-y-3">
              {[
                "Validating URL",
                "Auditing SEO & meta",
                "Measuring performance",
                "Checking accessibility",
              ].map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl bg-surface px-4 py-2.5 text-sm"
                >
                  <Loader2
                    className={`h-3.5 w-3.5 ${i < 2 ? "text-primary animate-spin" : "text-muted-foreground"}`}
                  />
                  <span className={i < 2 ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {step}
                  </span>
                  {i < 2 && <span className="ml-auto text-xs text-muted-foreground">Running…</span>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Try:</span>
            {examples.map((e) => (
              <button
                key={e}
                onClick={() => setUrl(`https://${e}`)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-surface hover:text-foreground"
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* What we check */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "SEO",
            "Accessibility",
            "Performance",
            "UX",
            "Security",
            "Mobile",
            "Best practices",
          ].map((t) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-4">
              <div className="h-2 w-8 rounded-full bg-primary/20">
                <div className="h-2 w-4 rounded-full bg-primary" />
              </div>
              <div className="text-heading mt-3 text-sm font-semibold">{t}</div>
              <div className="text-xs text-muted-foreground">Audited by AI</div>
            </div>
          ))}
        </div>

        {/* Recent */}
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-heading text-sm font-semibold">Recent analyses</h3>
          </div>
          <div className="card-surface divide-y divide-border">
            {recent.map(({ analysis, site }) => (
              <Link
                key={analysis.id}
                to="/reports/$id"
                params={{ id: analysis.id }}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{site.url}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-heading text-base font-semibold tabular-nums">
                  {analysis.overall_score ?? "-"}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            {recent.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Your completed analyses will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
