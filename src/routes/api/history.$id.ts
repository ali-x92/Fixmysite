import { createFileRoute } from "@tanstack/react-router";

import { deleteHistoryParamsSchema } from "@/features/history/contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedParams } from "@/server/validation/handler";
import { databaseErrorResponse, notFoundResponse } from "@/server/validation/response";

export const Route = createFileRoute("/api/history/$id")({
  server: {
    handlers: {
      DELETE: async ({ params, request }) => {
        const parsedParams = withValidatedParams(params, deleteHistoryParamsSchema);
        if (parsedParams instanceof Response) return parsedParams;
        const authenticated = await requireUser(request);
        if (authenticated instanceof Response) return authenticated;
        try {
          const deleted = await createServerServices(authenticated.client).history.deleteAnalysis(
            authenticated.user.id,
            parsedParams.id,
          );
          return deleted ? new Response(null, { status: 204 }) : notFoundResponse();
        } catch (error) {
          return databaseErrorResponse(error);
        }
      },
    },
  },
});
