import { createFileRoute } from "@tanstack/react-router";

import { fixRequestSchema, fixResponseSchema } from "@/features/issues/contracts";
import { requireUser } from "@/server/auth/require-user";
import { createServerServices } from "@/server/services/server-services";
import { withValidatedJson } from "@/server/validation/handler";
import {
  databaseErrorResponse,
  jsonResponse,
  notFoundResponse,
  usageLimitResponse,
} from "@/server/validation/response";
import { UsageLimitError } from "@/server/services/usage-limits";

export const Route = createFileRoute("/api/fix")({
  server: {
    handlers: {
      POST: ({ request }) =>
        withValidatedJson(request, fixRequestSchema, async (input) => {
          const authenticated = await requireUser(request);
          if (authenticated instanceof Response) return authenticated;
          try {
            const result = await createServerServices(authenticated.client).fix.requestFix(
              authenticated.user.id,
              input,
            );
            return result ? jsonResponse(fixResponseSchema, result) : notFoundResponse();
          } catch (error) {
            if (error instanceof UsageLimitError) return usageLimitResponse(error.message);
            return databaseErrorResponse(error);
          }
        }),
    },
  },
});
