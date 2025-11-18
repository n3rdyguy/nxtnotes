import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";
import { generateTokens, setCookieToken } from "~/server/utils/security";

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
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
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
  catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to refresh token",
    });
  }
});
