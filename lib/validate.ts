// lib/validate.ts
import { z } from "zod";
import { NextResponse } from "next/server";

// Next 15 can pass params as a Promise
export async function getParams<T extends z.ZodTypeAny>(ctx: any, schema: T) {
  const p = ctx?.params;
  const raw = p && typeof p.then === "function" ? await p : p;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: NextResponse.json({ error: "Invalid params", issues: parsed.error.format() }, { status: 400 }) };
  }
  return { ok: true as const, data: parsed.data as z.infer<T> };
}

export async function getJson<T extends z.ZodTypeAny>(req: Request, schema: T) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return { ok: false as const, error: NextResponse.json({ error: "Invalid body", issues: parsed.error.format() }, { status: 400 }) };
  }
  return { ok: true as const, data: parsed.data as z.infer<T> };
}
