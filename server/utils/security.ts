import type { H3Event } from "h3";
import jwt from "jsonwebtoken";
import { env } from "./env";

interface User {
  id: number
  email: string
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

interface RateLimitData {
  count: number
  startTime: number
}

/**
 * Generate access and refresh tokens for a user
 */
export function generateTokens(user: User): TokenPair {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
}

/**
 * Set a cookie token with secure options
 */
export function setCookieToken(event: H3Event, name: string, value: string): void {
  setCookie(event, name, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: name === "refreshToken" ? 60 * 60 * 24 * 7 : 60 * 15, // 7 days or 15 mins
  });
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
