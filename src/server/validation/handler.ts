import { z } from "zod";

import { validationErrorResponse } from "./response";

export async function withValidatedJson<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<Response>,
): Promise<Response> {
  const body: unknown = await request.json().catch(() => undefined);
  const result = schema.safeParse(body);
  if (!result.success) return validationErrorResponse(result.error);
  return handler(result.data);
}

export function withValidatedParams<TSchema extends z.ZodTypeAny>(
  params: unknown,
  schema: TSchema,
): z.infer<TSchema> | Response {
  const result = schema.safeParse(params);
  return result.success ? result.data : validationErrorResponse(result.error);
}
