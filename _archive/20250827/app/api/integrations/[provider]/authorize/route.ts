// app/api/integrations/[provider]/authorize/route.ts
import type { NextRequest } from "next/server";
import RouteContext from "next";

// Next.js 15: use the RouteContext<'/literal'> helper and await ctx.params
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/integrations/[provider]/authorize">
) {
  const { provider } = await ctx.params;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/connect", base);
  url.searchParams.set("connected", String(provider).toLowerCase());

  return Response.redirect(url.toString());
}
