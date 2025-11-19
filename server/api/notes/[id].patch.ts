import prisma from "~~/lib/prisma";
import { getSession } from "~~/server/utils/security";
import { validateBody, validateParams } from "~~/server/utils/validation";
import { noteIdParamSchema, updateNoteSchema } from "~~/shared/schemas/note.schema";

export default defineEventHandler(async (event) => {
  try {
    // Get session from BetterAuth
    const session = await getSession(event);

    // Validate route parameters
    const { id } = validateParams(event, noteIdParamSchema);

    // Validate request body
    const { updatedNote } = await validateBody(event, updateNoteSchema);

    // Verify user owns the note
    const noteTryingToUpdate = await prisma.notes.findFirst({
      where: {
        id,
        user_id: session.user.id,
      },
    });

    if (!noteTryingToUpdate) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden to update note",
      });
    }

    // Update note
    await prisma.notes.update({
      where: { id },
      data: { text: updatedNote },
    });
  }
  catch (error: any) {
    // Re-throw if already an H3Error
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
