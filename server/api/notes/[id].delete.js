// /api/notes.post create new note
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const token = cookies.jwtToken;
    const decoded = token ? jwt.verify(token, process.env.JWT_SECRET) : null;
    if (!token || !decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    const noteTryingToDelete = await prisma.notes.findFirst({
      where: {
        id: Number(event.context.params.id),
        user_id: decoded.id,
      },
    }); // verify user owns the note
    if (!noteTryingToDelete) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden to delete note",
      });
    }
    const deletedNote = await prisma.notes.delete({
      where: {
        id: Number(event.context.params.id),
      },
    });
    return deletedNote;
  }
  catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
