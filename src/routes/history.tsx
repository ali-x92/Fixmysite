import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Filter, Globe, Search, Trash2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { deleteAnalysis, getHistory } from "@/lib/api-client";
import { useToast } from "@/lib/toast";
import type { HistoryResponse } from "@/features/history/contracts";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — FixMySite AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse["entries"]>([]);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    getHistory()
      .then((response) => setHistory(response.entries))
      .catch((cause) => setError(cause.message));
  }, []);

  const entries = useMemo(() => {
    const now = Date.now();
    return history.filter(({ analysis, site }) => {
      const matchesQuery = `${site.url} ${analysis.id}`.toLowerCase().includes(query.toLowerCase());
      const age = now - new Date(analysis.created_at).getTime();
      const matchesRange =
        range === "All" ||
        (range === "Last 7 days" && age <= 604_800_000) ||
        (range === "This month" &&
          new Date(analysis.created_at).getMonth() === new Date().getMonth());
      return matchesQuery && matchesRange;
    });
  }, [history, query, range]);

  const remove = async (id: string) => {
    try {
      await deleteAnalysis(id);
      setHistory((current) => current.filter((entry) => entry.analysis.id !== id));
      notify("Report deleted.", "success");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to delete this report.";
      setError(message);
      notify(message, "error");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 animate-in-up">
        <PageHeader
          eyebrow="Timeline"
          title="Analysis history"
          description="Every scan in reverse chronological order."
        />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search URLs…"
              aria-label="Search analysis history"
              className="h-11 w-full rounded-xl border border-border bg-card pl-9 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          {["All", "Last 7 days", "This month"].map((label) => (
            <button
              key={label}
              onClick={() => setRange(label)}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium ${range === label ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-surface"}`}
            >
              {range === label && <Filter className="h-4 w-4" />}
              {label}
            </button>
          ))}
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
        <div className="mt-8 relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border" aria-hidden />
          <ul className="space-y-3">
            {entries.map(({ analysis, site }) => (
              <li key={analysis.id} className="relative pl-12">
                <span className="absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="card-surface flex items-center gap-4 p-4">
                  <Link
                    to="/reports/$id"
                    params={{ id: analysis.id }}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {site.url}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleString()} · Report #
                        {analysis.id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="text-heading text-xl font-semibold tabular-nums">
                      {analysis.overall_score ?? "—"}
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(analysis.id)}
                    aria-label={`Delete report for ${site.domain}`}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {!entries.length && (
              <li className="card-surface p-8 text-center text-sm text-muted-foreground">
                No analyses match your filters.
              </li>
            )}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
