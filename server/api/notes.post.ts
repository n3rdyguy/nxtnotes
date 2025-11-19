import type { JwtPayload } from "~~/shared/schemas/auth.schema";
import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";
import { env } from "~~/server/utils/env";
import { jwtPayloadSchema } from "~~/shared/schemas/auth.schema";

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

    // Create new note
    const newNote = await prisma.notes.create({
      data: {
        user_id: decoded.id,
        text: "",
      },
    });

    return newNote;
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
