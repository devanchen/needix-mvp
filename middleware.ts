// middleware.ts
export { auth as middleware } from "./auth";

export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/subscriptions/:path*", "/orders/:path*"],
};
