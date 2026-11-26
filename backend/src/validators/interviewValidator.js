import { z } from "zod";

export const analyzeSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(100, "Job description kam se kam 100 characters ki honi chahiye")
    .max(12000, "Job description 12000 characters se chhoti honi chahiye"),
  jobRole: z.string().trim().max(100).optional().default(""),
  experience: z.string().trim().max(100).optional().default(""),
});
