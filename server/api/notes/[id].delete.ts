import type { JwtPayload } from "~/shared/schemas/auth.schema";
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";
import { env } from "~/server/utils/env";
import { validateParams } from "~/server/utils/validation";
import { jwtPayloadSchema } from "~/shared/schemas/auth.schema";
import { noteIdParamSchema } from "~/shared/schemas/note.schema";

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

    // Validate route parameters
    const { id } = validateParams(event, noteIdParamSchema);

    // Verify user owns the note
    const noteTryingToDelete = await prisma.notes.findFirst({
      where: {
        id,
        user_id: decoded.id,
      },
    });

    if (!noteTryingToDelete) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden to delete note",
      });
    }

    // Delete note
    const deletedNote = await prisma.notes.delete({
      where: { id },
    });

    return deletedNote;
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
