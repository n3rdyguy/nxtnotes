import { z } from "zod";

/**
 * Common email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .regex(
    /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
    "Invalid email format",
  );

/**
 * Strong password validation schema
 * Requires: min 8 chars, at least one uppercase, one lowercase, and one number
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/,
    "Password must include uppercase, lowercase and number",
  );

/**
 * Regular password validation (for login)
 */
export const passwordSchema = z.string().min(1, "Password is required");

/**
 * Positive integer ID validation
 */
export const positiveIntSchema = z.coerce
  .number()
  .int("ID must be an integer")
  .positive("ID must be positive");

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
