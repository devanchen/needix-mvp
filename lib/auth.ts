// lib/auth.ts
// Re-export the real Auth.js helpers from /auth.ts
export { auth, signIn, signOut } from "@/auth";
export type { Session } from "next-auth";
