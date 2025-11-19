import type { JwtPayload } from "~~/shared/schemas/auth.schema";
import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";
import { env } from "~~/server/utils/env";
import { jwtPayloadSchema } from "~~/shared/schemas/auth.schema";

/**
 * GET /api/notes
 * Fetch all notes for the authenticated user
 */
export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const token = cookies.accessToken;

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Verify and validate JWT
    let decoded: JwtPayload;
    try {
      const rawDecoded = jwt.verify(token, env.JWT_SECRET);
      decoded = jwtPayloadSchema.parse(rawDecoded);
    }
    catch {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Fetch user's notes
    const notes = await prisma.notes.findMany({
      where: {
        user_id: decoded.id,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return notes;
  }
  catch (error: any) {
    // Re-throw if already an H3Error
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
});
