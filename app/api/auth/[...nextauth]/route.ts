// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";
// NOTE: relative import ensures THIS route uses the exact /auth.ts file below.
export { GET, POST } from "../../../../auth";
