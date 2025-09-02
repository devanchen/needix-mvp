// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";
// Import from project root to avoid alias confusion.
export { GET, POST } from "../../../../auth";
