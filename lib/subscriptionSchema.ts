import { z } from "zod";
export const subscriptionBody = z.object({
  service: z.string().min(1).trim(),
  plan: z.string().trim().optional().nullable(),
  manageUrl: z.string().url().trim().optional().nullable(),
  price: z.union([z.number(), z.string(), z.null()]).optional(),
  nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});
export type SubscriptionBody = z.infer<typeof subscriptionBody>;
