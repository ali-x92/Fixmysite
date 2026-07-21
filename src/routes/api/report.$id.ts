import { createFileRoute } from "@tanstack/react-router";

import { reportParamsSchema, reportResponseSchema } from "@/features/analysis/contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedParams } from "@/server/validation/handler";
import {
  databaseErrorResponse,
  jsonResponse,
  notFoundResponse,
} from "@/server/validation/response";

export const Route = createFileRoute("/api/report/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const parsedParams = withValidatedParams(params, reportParamsSchema);
        if (parsedParams instanceof Response) return parsedParams;
        const authenticated = await requireUser(request);
        if (authenticated instanceof Response) return authenticated;
        try {
          const payload = await createServerServices(authenticated.client).report.getReport(
            authenticated.user.id,
            parsedParams.id,
          );
          return payload ? jsonResponse(reportResponseSchema, payload) : notFoundResponse();
        } catch (error) {
          return databaseErrorResponse(error);
        }
      },
    },
  },
});
