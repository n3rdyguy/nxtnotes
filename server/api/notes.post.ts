import prisma from "~~/lib/prisma";
import { requireAuthSession } from "~~/server/utils/security";

export default defineEventHandler(async (event) => {
  try {
    // Get session from BetterAuth
    const session = await requireAuthSession(event);

    // Create new note
    const newNote = await prisma.notes.create({
      data: {
        user_id: session.user.id,
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
