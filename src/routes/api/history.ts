import { createFileRoute } from "@tanstack/react-router";

import { historyResponseSchema } from "@/features/history/contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { databaseErrorResponse, jsonResponse } from "@/server/validation/response";

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authenticated = await requireUser(request);
        if (authenticated instanceof Response) return authenticated;
        try {
          const payload = await createServerServices(authenticated.client).history.getHistory(
            authenticated.user.id,
          );
          return jsonResponse(historyResponseSchema, payload);
        } catch (error) {
          return databaseErrorResponse(error);
        }
      },
    },
  },
});
