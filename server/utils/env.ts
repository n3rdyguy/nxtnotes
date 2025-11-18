import { z } from "zod";

/**
 * Environment variable schema with validation rules
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security")
    .refine(
      val => val.length >= 32,
      "JWT_SECRET should be a strong random string (minimum 32 characters)",
    ),
});

/**
 * Validated and typed environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws an error with helpful messages if validation fails
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Environment validation failed. Please check your .env file.");
  }

  return parsed.data;
}

/**
 * Validated environment variables - safe to use throughout the application
 */
export const env = validateEnv();
