import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  session: {
    expiresIn: 60 * 15, // 15 minutes (matching your current access token expiry)
    updateAge: 60 * 15, // Update session every 15 minutes
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days (matching your current refresh token expiry)
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(), // Custom ID generator for String-based primary keys
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  trustedOrigins: process.env.NODE_ENV === "production"
    ? [process.env.BETTER_AUTH_URL || ""]
    : ["http://localhost:3000", "http://0.0.0.0:3000"],
});
