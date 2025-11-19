import type { JwtPayload } from "~~/shared/schemas/auth.schema";
import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";
import { env } from "~~/server/utils/env";
import { generateTokens, setCookieToken } from "~~/server/utils/security";
import { jwtPayloadSchema } from "~~/shared/schemas/auth.schema";

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: "No refresh token provided",
      });
    }

    // Verify refresh token
    let decoded: JwtPayload;
    try {
      const rawDecoded = jwt.verify(refreshToken, env.JWT_SECRET);
      decoded = jwtPayloadSchema.parse(rawDecoded);
    }
    catch {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid refresh token",
      });
    }

    // Check if refresh token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.user_id !== decoded.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.user);

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        user_id: storedToken.user_id,
      },
    });

    // Set new cookies
    setCookieToken(event, "accessToken", accessToken);
    setCookieToken(event, "refreshToken", newRefreshToken);

    return { data: "success" };
  }
  catch (error: any) {
    // Re-throw if already an H3Error
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to refresh token",
    });
  }
});
