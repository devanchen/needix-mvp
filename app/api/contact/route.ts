import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    if (!(req.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Use application/json" }, { status: 415 });
    }

    const body = await req.json();
    const { name, email, topic = "", message = "", website = "" } = body || {};

    // Honeypot
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Validation
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
    }
    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ ok: false, error: "Message is too short." }, { status: 400 });
    }

    // Send via Resend if configured
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Needix <hello@needix.com>";
    const support = process.env.SUPPORT_EMAIL || "support@needix.com";

    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        // to your team
        await resend.emails.send({
          from,
          to: [support],
          subject: `[Contact] ${topic || "General"} — ${name}`,
          text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
        });

        // optional: confirmation to sender
        if (process.env.CONTACT_SEND_COPY === "1") {
          await resend.emails.send({
            from,
            to: [email],
            subject: "We got your message",
            text: `Thanks for reaching out to Needix.\n\nWe received your message:\n\n${message}\n\nWe’ll reply to ${email} soon.`,
          });
        }
      } catch (e) {
        console.error("[contact] Resend error:", e);
        // continue; return ok to the client
      }
    }

    console.log("[contact] incoming:", { name, email, topic, len: message.length });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
