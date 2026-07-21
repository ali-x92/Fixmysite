import { createFileRoute } from "@tanstack/react-router";

import { summaryRequestSchema, summaryResponseSchema } from "@/features/analysis/ai-contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedJson } from "@/server/validation/handler";
import {
  databaseErrorResponse,
  jsonResponse,
  notFoundResponse,
} from "@/server/validation/response";

export const Route = createFileRoute("/api/summary")({
  server: {
    handlers: {
      POST: ({ request }) =>
        withValidatedJson(request, summaryRequestSchema, async (input) => {
          const authenticated = await requireUser(request);
          if (authenticated instanceof Response) return authenticated;
          try {
            const summary = await createServerServices(authenticated.client).summary.generate(
              authenticated.user.id,
              input.analysisId,
            );
            return summary
              ? jsonResponse(summaryResponseSchema, { analysisId: input.analysisId, summary })
              : notFoundResponse();
          } catch (error) {
            return databaseErrorResponse(error);
          }
        }),
    },
  },
});
