import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.enum([
    "unauthorized",
    "not_found",
    "validation_error",
    "database_error",
    "analysis_error",
    "usage_limit",
  ]),
  message: z.string(),
  details: z.unknown().optional(),
});

export function jsonResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: z.input<TSchema>,
  status = 200,
): Response {
  return Response.json(schema.parse(payload), { status });
}

export function validationErrorResponse(error: z.ZodError): Response {
  return jsonResponse(
    apiErrorSchema,
    { error: "validation_error", message: "Invalid request", details: error.flatten() },
    400,
  );
}

export function unauthorizedResponse(): Response {
  return jsonResponse(
    apiErrorSchema,
    { error: "unauthorized", message: "Authentication is required" },
    401,
  );
}

export function notFoundResponse(): Response {
  return jsonResponse(apiErrorSchema, { error: "not_found", message: "Resource not found" }, 404);
}

export function usageLimitResponse(message: string): Response {
  return jsonResponse(apiErrorSchema, { error: "usage_limit", message }, 403);
}

export function analysisErrorResponse(cause?: unknown): Response {
  const rawDetails =
    cause instanceof Error
      ? cause.message
      : cause && typeof cause === "object" && "message" in cause
        ? String(cause.message)
        : undefined;
  // Scan failures are operational diagnostics (Chromium, Lighthouse, or the
  // submitted public URL). Returning a bounded message lets the UI show the
  // actionable cause instead of an opaque HTTP 422.
  const details = rawDetails?.slice(0, 1_000);
  return jsonResponse(
    apiErrorSchema,
    {
      error: "analysis_error",
      message:
        "The scan could not be completed. Make sure the website is public and reachable, then try again.",
      details,
    },
    422,
  );
}

export function databaseErrorResponse(cause?: unknown): Response {
  const errorDetails =
    cause && typeof cause === "object"
      ? `${"message" in cause ? String(cause.message) : ""} ${"code" in cause ? String(cause.code) : ""}`
      : cause instanceof Error
        ? cause.message
        : "";
  const configurationError =
    /SUPABASE_|environment|url|PGRST205|42P01|relation .* does not exist/i.test(errorDetails);
  return jsonResponse(
    apiErrorSchema,
    {
      error: "database_error",
      message: configurationError
        ? "FixMySite AI is not connected to its database schema. Verify the Supabase environment variables and apply the project migrations."
        : "We could not complete that database request. Please try again in a moment.",
    },
    500,
  );
}
