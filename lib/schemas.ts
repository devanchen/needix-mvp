// lib/schemas.ts
import { z } from "zod";

/** ---------- Shared primitives ---------- */
export const IdSchema = z.union([z.string().uuid(), z.string().cuid2()]).or(z.string().min(8)); // fallback
export const ISODateYMD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
export const Slug = z.string().trim().regex(/^[a-z0-9-]+$/i, "Only letters, numbers, and dashes");

/** Money as number (already coerced on client), allow null/undefined */
export const MoneyNumberNullable = z.number().nonnegative().finite().optional().nullable();

/** ---------- Subscriptions ---------- */
export const SubscriptionBody = z.object({
  service: z.string().min(1, "Service is required").trim(),
  plan: z.string().trim().optional().nullable(),
  manageUrl: z.string().url().trim().optional().nullable(),
  // Accept number or numeric string (from <input type="number">). Null/empty → null.
  price: z
    .union([z.number(), z.string(), z.null()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) && n >= 0 ? n : null;
    })
    .optional()
    .nullable(),
  // Accept YYYY-MM-DD or null/undefined
  nextDate: ISODateYMD.optional().nullable(),
});
export type TSubscriptionBody = z.infer<typeof SubscriptionBody>;

/** ---------- Items (if/when you track household items) ---------- */
export const ItemUpsertBody = z.object({
  name: z.string().min(1).trim(),
  brand: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(1),
  price: z.coerce.number().nonnegative().optional().nullable(),
  cadenceDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
  nextDate: ISODateYMD.optional().nullable(),
  link: z.string().url().optional().nullable(),
});
export type TItemUpsertBody = z.infer<typeof ItemUpsertBody>;

/** ---------- Contact form ---------- */
export const ContactBody = z.object({
  name: z.string().min(1).max(80).trim(),
  email: z.string().email().toLowerCase(),
  message: z.string().min(5).max(2000).trim(),
});
export type TContactBody = z.infer<typeof ContactBody>;

/** ---------- Newsletter ---------- */
export const NewsletterBody = z.object({
  email: z.string().email().toLowerCase(),
});
export type TNewsletterBody = z.infer<typeof NewsletterBody>;

/** ---------- Credentials sign-in (if you add a real signup later) ---------- */
export const CredentialsBody = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(3).max(128),
});
export type TCredentialsBody = z.infer<typeof CredentialsBody>;

/** ---------- Query helpers (pagination, searching) ---------- */
export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type TPaginationQuery = z.infer<typeof PaginationQuery>;

/** ---------- Dynamic route params ---------- */
export const IdParam = z.object({ id: IdSchema });
export type TIdParam = z.infer<typeof IdParam>;

/** /api/integrations/[provider]/authorize */
export const ProviderParam = z.object({ provider: Slug });
export type TProviderParam = z.infer<typeof ProviderParam>;
