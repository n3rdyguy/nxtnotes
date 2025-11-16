// /api/notes pull notes from db
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const notes = await prisma.notes.findMany();
    console.log("notes", notes);
    return notes;
  }
  catch (error) {
    throw error;
  }
});
