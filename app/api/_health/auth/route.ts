// app/api/_health/auth/route.ts
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({
      ok: true,
      hasSession: Boolean(session),
      env: {
        NEXTAUTH_URL: Boolean(process.env.NEXTAUTH_URL ?? process.env.AUTH_URL),
        AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
        GOOGLE_KEYS_PRESENT: Boolean(
          (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID) &&
            (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET)
        ),
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
