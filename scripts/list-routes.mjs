// scripts/list-routes.mjs
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");

const PAGES = [];
const APIS = [];
const LAYOUTS = [];

function toRoute(segments) {
  const clean = segments
    .filter(Boolean)
    .filter((s) => !(s.startsWith("(") && s.endsWith(")"))) // group segments
    .map((s) => {
      if (s.startsWith("[[...") && s.endsWith("]]")) return ":" + s.slice(5, -2) + "*";
      if (s.startsWith("[...") && s.endsWith("]")) return ":" + s.slice(4, -1) + "*";
      if (s.startsWith("[") && s.endsWith("]")) return ":" + s.slice(1, -1);
      return s;
    });
  const out = "/" + clean.join("/");
  return out === "/page" ? "/" : out.replace(/\/page$/, "") || "/";
}

function walk(dir, relParts = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(abs, relParts.concat(e.name));
      continue;
    }
    if (!e.isFile()) continue;

    if (e.name === "page.tsx" || e.name === "page.jsx") {
      PAGES.push(toRoute(relParts.concat("page")));
    }
    if (e.name === "route.ts" || e.name === "route.js") {
      // API routes
      const idx = relParts.indexOf("api");
      if (idx >= 0) {
        APIS.push("/" + relParts.join("/"));
      }
    }
    if (e.name === "layout.tsx" || e.name === "layout.jsx") {
      LAYOUTS.push("/" + relParts.join("/"));
    }
  }
}

if (fs.existsSync(APP_DIR)) {
  walk(APP_DIR, []);
} else {
  console.error("No ./app directory found");
  process.exit(1);
}

function uniq(a) { return [...new Set(a)].sort(); }

console.log("== ROUTES ==");
for (const r of uniq(PAGES)) console.log("  •", r);
console.log("\n== API ENDPOINTS ==");
for (const r of uniq(APIS)) console.log("  •", r);
console.log("\n== LAYOUT SEGMENTS ==");
for (const r of uniq(LAYOUTS)) console.log("  •", r);

console.log("\nTip: routes shown here are what Next.js will serve right now.");
