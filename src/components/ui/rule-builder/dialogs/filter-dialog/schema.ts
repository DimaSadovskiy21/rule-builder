import { z } from "zod";

// types
import { OPERATOR_TYPE } from "@/types/filter";

export const formSchema = z.object({
  field: z.string().trim().min(1, "Field is required"),
  value: z.string().trim().min(1, "Value is required"),
  operator: z.nativeEnum(OPERATOR_TYPE),
});

export type FormValues = z.infer<typeof formSchema>;
