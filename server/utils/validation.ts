import type { H3Event } from "h3";
import type { ZodSchema } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Validate request body against a Zod schema
 * Returns typed data or throws a user-friendly error
 */
export async function validateBody<T>(event: H3Event, schema: ZodSchema<T>): Promise<T> {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      statusCode: 400,
      message: validationError.message,
    });
  }

  return result.data;
}

/**
 * Validate route parameters against a Zod schema
 * Returns typed data or throws a user-friendly error
 */
export function validateParams<T>(event: H3Event, schema: ZodSchema<T>): T {
  const params = event.context.params;
  const result = schema.safeParse(params);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      statusCode: 400,
      message: validationError.message,
    });
  }

  return result.data;
}

/**
 * Validate query parameters against a Zod schema
 * Returns typed data or throws a user-friendly error
 */
export function validateQuery<T>(event: H3Event, schema: ZodSchema<T>): T {
  const query = getQuery(event);
  const result = schema.safeParse(query);

  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      statusCode: 400,
      message: validationError.message,
    });
  }

  return result.data;
}
