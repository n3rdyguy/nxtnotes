import { z } from "zod";
import { positiveIntSchema } from "./common.schema";

/**
 * Create note request schema (empty note)
 */
export const createNoteSchema = z.object({
  // Notes are created empty, no body required
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * Update note request schema
 */
export const updateNoteSchema = z.object({
  updatedNote: z.string(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * Note ID parameter schema
 */
export const noteIdParamSchema = z.object({
  id: positiveIntSchema,
});

export type NoteIdParam = z.infer<typeof noteIdParamSchema>;

/**
 * Complete note object schema
 */
export const noteSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  text: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Note = z.infer<typeof noteSchema>;
