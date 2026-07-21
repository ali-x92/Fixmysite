import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import type { HistoryResponse } from "@/features/history/contracts";
import { getHistory } from "@/lib/api-client";

export const Route = createFileRoute("/reports/")({
  head: () => ({ meta: [{ title: "Reports — FixMySite AI" }] }),
  component: ReportsList,
});

function ReportsList() {
  const [entries, setEntries] = useState<HistoryResponse["entries"]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getHistory()
      .then((response) => setEntries(response.entries))
      .catch((cause) => setError(cause.message));
  }, []);
  const filtered = useMemo(
    () =>
      entries.filter(({ analysis, site }) =>
        `${site.url} ${analysis.id}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [entries, query],
  );
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up">
        <PageHeader
          eyebrow="Reports"
          title="All website audits"
          description="Your saved website analyses and their scores."
          actions={
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
            >
              New analysis
            </Link>
          }
        />
        <div className="mt-8 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by URL or ID…"
            aria-label="Search reports"
            className="h-11 w-full rounded-xl border border-border bg-card pl-9 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-6 card-surface overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_100px_120px] items-center gap-4 border-b border-border bg-surface px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Website</div>
            <div>Score</div>
            <div>Date</div>
          </div>
          {filtered.map(({ analysis, site }) => (
            <Link
              key={analysis.id}
              to="/reports/$id"
              params={{ id: analysis.id }}
              className="grid grid-cols-[minmax(0,1fr)_100px_120px] items-center gap-4 border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-surface"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{site.url}</div>
                  <div className="text-xs text-muted-foreground">
                    Report #{analysis.id.slice(0, 8)}
                  </div>
                </div>
              </div>
              <div className="text-heading text-lg font-semibold tabular-nums">
                {analysis.overall_score ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(analysis.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
          {!filtered.length && (
            <p className="p-8 text-center text-sm text-muted-foreground">No reports found.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
