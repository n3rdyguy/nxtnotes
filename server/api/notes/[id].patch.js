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
    console.log("Body id:", event.context.params.id);
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
    console.log("Error in notes/id.patch.js:", error);
  }
});
