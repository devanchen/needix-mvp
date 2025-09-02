// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/auth-utils";
import { resend, RESEND_FROM } from "@/lib/resend";

export const runtime = "nodejs";

const CONTACT_TO =
  process.env.CONTACT_TO || "support@needix.com"; // change to your real support inbox

export async function POST(req: Request) {
  const userId = await getUserIdOrDev(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, message } = await req.json();

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        { error: "Missing or invalid name, email, or message" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_TO,             // can also be an array: [CONTACT_TO]
      replyTo: email,             // ✅ correct key is replyTo
      subject: `Contact form — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "Failed to send contact form" },
      { status: 500 }
    );
  }
}
