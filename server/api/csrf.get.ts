import { randomBytes } from "node:crypto";
import { env } from "~/server/utils/env";

export default defineEventHandler((event) => {
  const csrfToken = randomBytes(32).toString("hex");

  setCookie(event, "csrf_token", csrfToken, {
    httpOnly: false, // Must be readable by JavaScript
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { csrfToken };
});
