// lib/auth-utils.ts
import { auth } from "@/auth";

// Dev override used by a few routes (e.g., contact form)
const DEV_KEY = "needix123";

export function isDevKey(key: string | null | undefined): boolean {
  return typeof key === "string" && key === DEV_KEY;
}

/**
 * Returns the authenticated user id if present.
 * If not signed in, returns "dev" only when the provided key matches DEV_KEY.
 *
 * Accepts either:
 *  - a string dev key, or
 *  - a Request object (reads 'x-needix-dev-key' header or '?devKey=' query)
 */
export async function getUserIdOrDev(
  arg?: Request | string | null | undefined,
): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  let key: string | null = null;

  if (typeof arg === "string") {
    key = arg;
  } else if (arg && typeof (arg as Request).headers === "object") {
    const req = arg as Request;
    // header takes precedence
    key =
      req.headers.get("x-needix-dev-key") ??
      ((): string | null => {
        try {
          return new URL(req.url).searchParams.get("devKey");
        } catch {
          return null;
        }
      })();
  }

  return isDevKey(key) ? "dev" : null;
}

// keep exporting auth for modules that import from here
export { auth };
