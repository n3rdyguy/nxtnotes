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

/**
 * JWT payload schema
 */
export const jwtPayloadSchema = z.object({
  id: z.number(),
  email: emailSchema,
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Token response schema
 */
export const tokenResponseSchema = z.object({
  data: z.literal("success"),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
