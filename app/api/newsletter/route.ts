// app/api/newsletter/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function isEmail(x: string): boolean {
  // simple but solid email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  if (!email || !isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
    }

  // If you have Resend set up, send a confirmation/notification
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Needix <noreply@needix.app>",
          to: process.env.RESEND_TO ?? email, // send to yourself or the user
          subject: "New Needix newsletter signup",
          html: `<p>${email} joined the Needix list.</p>`,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.warn("RESEND error:", t);
      }
    } catch (e) {
      console.warn("RESEND request failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
