import prisma from "~~/lib/prisma";
import { getSession } from "~~/server/utils/security";

/**
 * GET /api/notes
 * Fetch all notes for the authenticated user
 */
export default defineEventHandler(async (event) => {
  try {
    // Get session from BetterAuth
    const session = await getSession(event);

    // Fetch user's notes
    const notes = await prisma.notes.findMany({
      where: {
        user_id: session.user.id,
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
