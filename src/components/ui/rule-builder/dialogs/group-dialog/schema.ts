import { z } from "zod";

export const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  logic: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;
