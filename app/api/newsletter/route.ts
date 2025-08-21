import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // ensure Node runtime (SDK needs it)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// very light in-memory rate limit (per region instance)
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
function rateLimit(key: string) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now - rec.ts > WINDOW_MS) {
    hits.set(key, { count: 1, ts: now });
    return true;
  }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Use application/json" }, { status: 415 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (req as any).ip ||
      "unknown";
    if (!rateLimit(`nl:${ip}`)) {
      return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email, website = "" } = await req.json();

    // honeypot
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Send emails via Resend if configured
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Needix <hello@needix.com>";
    const support = process.env.SUPPORT_EMAIL || "support@needix.com";

    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        // notify your team
        await resend.emails.send({
          from,
          to: [support],
          subject: "New newsletter signup",
          text: `Email: ${email}\nSource: footer\nTime: ${new Date().toISOString()}`,
        });

        // optional: send subscriber a confirmation
        if (process.env.NEWSLETTER_SEND_WELCOME === "1") {
          await resend.emails.send({
            from,
            to: [email],
            subject: "You’re on the list ✅",
            text: "Thanks for subscribing to Needix updates. We’ll only email when it’s useful.",
          });
        }
      } catch (e) {
        console.error("[newsletter] Resend error:", e);
        // still return ok; we don't want to leak ESP failures to users
      }
    }

    console.log("[newsletter] subscribed:", email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
