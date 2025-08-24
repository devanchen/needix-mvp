// app/api/contact/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ContactBody } from "@/lib/schemas";
import { getJson } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await getJson(req, ContactBody);
  if (!body.ok) return body.error;

  const { name, email, message } = body.data;
  // TODO: send email or store message
  return NextResponse.json({ ok: true }, { status: 200 });
}
