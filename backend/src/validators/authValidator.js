import { z } from "zod";

const password = z
  .string()
  .min(8, "Password kam se kam 8 characters ka ho")
  .max(72, "Password 72 characters se chhota ho")
  .regex(/[A-Za-z]/, "Password mein ek letter hona chahiye")
  .regex(/\d/, "Password mein ek number hona chahiye");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name kam se kam 2 characters ka ho").max(60),
  email: z.string().trim().toLowerCase().email("Valid email daalo"),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email daalo"),
  password: z.string().min(1, "Password daalo"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    headline: z.string().trim().max(120),
    targetRole: z.string().trim().max(80),
    experienceLevel: z.enum(["Fresher", "0-2 years", "2-5 years", "5+ years"]),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Update karne ke liye kam se kam ek field do");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password daalo"),
  newPassword: password,
});
