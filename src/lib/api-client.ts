import type { ReportResponse } from "@/features/analysis/contracts";
import type { AiFixResponse, AiSummary } from "@/features/analysis/ai-contracts";
import type { HistoryResponse } from "@/features/history/contracts";

import { getSupabaseBrowserClient } from "./supabase/client";

async function authenticatedFetch(path: string, init?: RequestInit): Promise<Response> {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  if (!data.session) throw new Error("Please sign in to continue.");
  return fetch(path, {
    ...init,
    headers: {
      ...init?.headers,
      authorization: `Bearer ${data.session.access_token}`,
    },
  });
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload ? payload.message : null;
    throw new Error(message ?? "The request could not be completed.");
  }
  return payload as T;
}

export async function getHistory(): Promise<HistoryResponse> {
  return readJson<HistoryResponse>(await authenticatedFetch("/api/history"));
}

export async function deleteAnalysis(id: string): Promise<void> {
  const response = await authenticatedFetch(`/api/history/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to delete this report.");
}

export async function getReport(id: string): Promise<ReportResponse> {
  return readJson<ReportResponse>(await authenticatedFetch(`/api/report/${id}`));
}

export async function getSummary(analysisId: string): Promise<AiSummary | null> {
  const response = await authenticatedFetch(`/api/summary/${analysisId}`);
  if (response.status === 204) return null;
  return (await readJson<{ summary: AiSummary }>(response)).summary;
}

export async function generateFix(issueId: string): Promise<AiFixResponse> {
  return readJson<AiFixResponse>(
    await authenticatedFetch("/api/fix", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ issueId }),
    }),
  );
}
