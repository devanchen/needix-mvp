// lib/validate.ts
import { ZodSchema } from "zod";

export function parseJson<T>(raw: unknown, schema: ZodSchema<T>): { ok: true; data: T } | { ok: false } {
  try {
    const data = schema.parse(raw);
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}
