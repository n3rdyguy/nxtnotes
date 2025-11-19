import { z } from "zod";
import { emailSchema, passwordSchema, strongPasswordSchema } from "./common.schema";

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register request schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
