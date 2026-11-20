/**
 * Lightweight mock-IAP file contract (kept for direct runs).
 * Prefer `npm run test:beta` → scripts/test-beta.mjs (Maestro or this fallback).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, [join(root, "scripts/test-beta.mjs")], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
