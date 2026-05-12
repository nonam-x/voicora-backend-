import { z } from "zod";

const answerInput = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOptionId: z.string().min(1, "Selected option ID is required"),
});

export const submitResponseSchema = z.object({
  answers: z
    .array(answerInput)
    .min(1, "At least one answer is required"),
  anonymousId: z.string().optional(),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
