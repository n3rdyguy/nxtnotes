// /api/notes/[id]
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
    const body = await readBody(event);
    // console.log("note_id: ", event.context.params.id, " decoded id:", decoded.id);
    const noteTryingToUpdate = await prisma.notes.findFirst({
      where: {
        id: Number(event.context.params.id),
        user_id: decoded.id,
      },
    }); // verify user owns the note
    if (!noteTryingToUpdate) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden to update note",
      });
    }
    // console.log("Body id:", event.context.params.id);
    await prisma.notes.update({
      where: {
        id: Number(event.context.params.id),
      },
      data: {
        text: body.updatedNote,
      },
    });
  }
  catch (error) {
    throw createError({
      statusCode: Number(error.statusCode) || 500,
      statusMessage: String(error.message),
    });
  }
});
