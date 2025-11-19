import type { H3Event } from "h3";
import { auth } from "~~/lib/auth";

interface RateLimitData {
  count: number
  startTime: number
}

/**
 * Get the current session from BetterAuth
 */
export async function getSession(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  return session;
}

const rateLimitMap = new Map<string, RateLimitData>();

/**
 * Rate limit requests by IP address
 * Throws 429 error if limit exceeded
 */
export function rateLimit(event: H3Event): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 100; // limit each IP to 100 requests per windowMs

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  }
  else {
    const data = rateLimitMap.get(ip)!;
    if (now - data.startTime > windowMs) {
      data.count = 1;
      data.startTime = now;
    }
    else {
      data.count++;
      if (data.count > max) {
        throw createError({
          statusCode: 429,
          statusMessage: "Too Many Requests",
        });
      }
    }
  }
}
