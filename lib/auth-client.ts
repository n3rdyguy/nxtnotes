import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "production"
    ? process.env.BETTER_AUTH_URL
    : undefined,
});
