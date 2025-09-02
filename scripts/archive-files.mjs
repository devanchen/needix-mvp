// scripts/archive-files.mjs
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LIST = path.join(ROOT, "_cleanup", "to-archive.txt");
const STAMP = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const TARGET_ROOT = path.join(ROOT, "_archive", STAMP);

if (!fs.existsSync(LIST)) {
  console.error("Missing _cleanup/to-archive.txt");
  process.exit(1);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function movePath(rel) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) {
    console.warn("Skip (not found):", rel);
    return;
  }
  const dest = path.join(TARGET_ROOT, rel);
  ensureDir(path.dirname(dest));

  try {
    // Fast path
    fs.renameSync(src, dest);
    console.log("Archived:", rel, "(rename)");
  } catch (err) {
    if (["EPERM", "EXDEV", "EBUSY"].includes(err.code)) {
      // Windows / cross-device fallback: copy then delete
      copyRecursive(src, dest);
      rmRecursive(src);
      console.log("Archived:", rel, "(copy+delete)");
    } else {
      throw err;
    }
  }
}

const lines = fs
  .readFileSync(LIST, "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("#"));

for (const rel of lines) movePath(rel);

console.log("\nDone. Review:", path.relative(ROOT, TARGET_ROOT));
