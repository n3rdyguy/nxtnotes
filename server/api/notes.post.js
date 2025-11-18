// /api/notes.post create new note
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event);
    const token = cookies.accessToken;
    const decoded = token ? jwt.verify(token, process.env.JWT_SECRET) : null;
    if (!token || !decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    const newNote = await prisma.notes.create({
      data: {
        user_id: decoded.id,
        text: "",
      },
    });
    return newNote;
  }
  catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
