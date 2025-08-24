// app/api/newsletter/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { NewsletterBody } from "@/lib/schemas";
import { getJson } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await getJson(req, NewsletterBody);
  if (!body.ok) return body.error;

  const { email } = body.data;
  // TODO: add to provider list
  return NextResponse.json({ ok: true }, { status: 200 });
}
