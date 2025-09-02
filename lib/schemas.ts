// lib/schemas.ts
import { z } from "zod";

export const ToggleEmailSchema = z.object({
  enabled: z.boolean(),
});

export type ToggleEmailInput = z.infer<typeof ToggleEmailSchema>;

export const SubscriptionPatchSchema = z.object({
  service: z.string().min(1).optional(),
  plan: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  nextDate: z.string().datetime().nullable().optional(),
  manageUrl: z.string().url().nullable().optional(),
  canceled: z.boolean().optional(),
});

export type SubscriptionPatchInput = z.infer<typeof SubscriptionPatchSchema>;
