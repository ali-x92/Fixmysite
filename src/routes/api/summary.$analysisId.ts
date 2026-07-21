import { createFileRoute } from "@tanstack/react-router";

import { summaryParamsSchema, summaryResponseSchema } from "@/features/analysis/ai-contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedParams } from "@/server/validation/handler";
import { databaseErrorResponse, jsonResponse } from "@/server/validation/response";

export const Route = createFileRoute("/api/summary/$analysisId")({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const validated = withValidatedParams(params, summaryParamsSchema);
        if (validated instanceof Response) return validated;
        return getSummary(request, validated.analysisId);
      },
    },
  },
});

async function getSummary(request: Request, analysisId: string): Promise<Response> {
  const authenticated = await requireUser(request);
  if (authenticated instanceof Response) return authenticated;
  try {
    const summaryService = createServerServices(authenticated.client).summary;
    // Generate AI guidance in its own request. This keeps the browser scan
    // below Netlify's function deadline while retaining automatic summaries.
    const summary =
      (await summaryService.getCached(authenticated.user.id, analysisId)) ??
      (await summaryService.generate(authenticated.user.id, analysisId));
    return summary
      ? jsonResponse(summaryResponseSchema, { analysisId, summary })
      : new Response(null, { status: 204 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
