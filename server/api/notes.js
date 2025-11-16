// /api/notes pull notes from db for specific user
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // eslint-disable-next-line no-useless-catch
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

    const notes = await prisma.notes.findMany({
      where: {
        user_id: decoded.id,
      },
      orderBy: {
        updated_at: "desc",
      },
    });
    // console.log("notes", notes);
    return notes;
  }
  catch (error) {
    throw error;
  }
});
