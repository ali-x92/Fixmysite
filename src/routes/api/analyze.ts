import { createFileRoute } from "@tanstack/react-router";

import { analyzeRequestSchema, analyzeResponseSchema } from "@/features/analysis/contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedJson } from "@/server/validation/handler";
import {
  analysisErrorResponse,
  databaseErrorResponse,
  jsonResponse,
  usageLimitResponse,
} from "@/server/validation/response";
import { UsageLimitError } from "@/server/services/usage-limits";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: ({ request }) =>
        withValidatedJson(request, analyzeRequestSchema, async (input) => {
          const authenticated = await requireUser(request);
          if (authenticated instanceof Response) return authenticated;
          try {
            const services = createServerServices(authenticated.client);
            const result = await services.analysisRunner.run(authenticated.user.id, input);
            return jsonResponse(analyzeResponseSchema, result, 201);
          } catch (error) {
            if (error instanceof UsageLimitError) return usageLimitResponse(error.message);
            console.error("[api/analyze] request failed", error);
            return isDatabaseError(error)
              ? databaseErrorResponse(error)
              : analysisErrorResponse(error);
          }
        }),
    },
  },
});

function isDatabaseError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const code = error.code;
  return typeof code === "string" && (/^PGRST\d+$/i.test(code) || /^[0-9A-Z]{5}$/.test(code));
}
