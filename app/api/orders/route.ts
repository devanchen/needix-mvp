import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Use application/json" }, { status: 415 });
    }

    const body = await req.json();
    const { deliveryId, retailer, priceCeiling } = body || {};

    if (!deliveryId || !retailer) {
      return NextResponse.json({ ok: false, error: "Missing deliveryId or retailer" }, { status: 400 });
    }

    // Here’s where you'd enforce ceilings and queue a real order flow.
    console.log("[orders] requested:", { deliveryId, retailer, priceCeiling, ts: new Date().toISOString() });

    // Return ok—front end will open the retailer URL in a new tab
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
