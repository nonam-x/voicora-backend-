import { z } from "zod";

const optionInput = z.object({
  text: z.string().min(1, "Option text is required").max(200).trim(),
});

const questionInput = z.object({
  text: z.string().min(1, "Question text is required").max(500).trim(),
  options: z
    .array(optionInput)
    .min(2, "Each question must have at least 2 options")
    .max(10, "Each question can have at most 10 options"),
});

export const createPollSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  questions: z
    .array(questionInput)
    .min(1, "Poll must have at least 1 question")
    .max(20, "Poll can have at most 20 questions"),
  responseMode: z.enum(["anonymous", "authenticated"]).default("anonymous"),
  isPublic: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

export const updatePollSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  questions: z
    .array(questionInput)
    .min(1)
    .max(20)
    .optional(),
  responseMode: z.enum(["anonymous", "authenticated"]).optional(),
  isPublic: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
