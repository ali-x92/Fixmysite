import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  aiFixCreditsUsed: z.number().int().nonnegative(),
  aiFixCreditsLimit: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  avatarUrl: z.string().url().nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Credentials = z.infer<typeof credentialsSchema>;
