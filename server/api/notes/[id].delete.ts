import prisma from "~~/lib/prisma";
import { requireAuthSession } from "~~/server/utils/security";
import { validateParams } from "~~/server/utils/validation";
import { noteIdParamSchema } from "~~/shared/schemas/note.schema";

export default defineEventHandler(async (event) => {
  try {
    // Get session from BetterAuth
    const session = await requireAuthSession(event);

    // Validate route parameters
    const { id } = validateParams(event, noteIdParamSchema);

    // Verify user owns the note
    const noteTryingToDelete = await prisma.notes.findFirst({
      where: {
        id,
        user_id: session.user.id,
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
