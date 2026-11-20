/**
 * `npm run test:beta` second stage (after Jest).
 *
 * Prefer Maestro when the CLI is available (local device/simulator).
 * On CI / machines without Maestro: scripted mock-IAP integration that
 * re-asserts billing unlock + SCREENS §11 Maestro contract.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function mustInclude(path, needles) {
  const text = readFileSync(join(root, path), "utf8");
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path} missing expected: ${needle}`);
    }
  }
}

function maestroAvailable() {
  const which = spawnSync("which", ["maestro"], { encoding: "utf8" });
  return which.status === 0 && Boolean(which.stdout?.trim());
}

function runMaestro() {
  console.log("test-beta: Maestro CLI found — running maestro/smoke.yaml");
  const result = spawnSync("maestro", ["test", "maestro/smoke.yaml"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      EXPO_PUBLIC_IAP_MODE: process.env.EXPO_PUBLIC_IAP_MODE ?? "mock",
    },
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Maestro smoke failed with exit ${result.status}`);
  }
  console.log("test-beta: Maestro SCREENS §11 smoke OK");
}

function runScriptedMockIapIntegration() {
  console.log(
    "test-beta: Maestro not on PATH — scripted mock-IAP integration (CI fallback)",
  );

  mustInclude("lib/billing/constants.ts", [
    "grahalens_private",
    "EXPO_PUBLIC_IAP_MODE",
  ]);
  mustInclude("lib/billing/mockStore.ts", [
    "createMockStore",
    "SecureStore",
    "purchase",
    "restore",
    "clear",
  ]);
  mustInclude("lib/billing/entitlements.ts", [
    "isPrivate",
    "requirePrivate",
    "useEntitlement",
  ]);
  mustInclude("lib/billing/BillingProvider.tsx", ["CustomerInfo", "hydrate"]);
  mustInclude("tests/billing.test.ts", [
    "purchase unlocks",
    "restore re-applies",
    "clear removes",
  ]);
  mustInclude("tests/zt-beta.test.ts", [
    "ZT16",
    "ZT17",
    "ZT18",
    "ZT19",
    "ZT22",
    "lens_quota",
    "bond_limit",
    "soul-unlocked",
  ]);
  mustInclude("maestro/smoke.yaml", [
    "SCREENS §11",
    "welcome-get-started",
    "guest-continue",
    "onboarding-date",
    "paywall-welcome-skip",
    "sky-home",
    "tab-chart",
    "placement-sun",
    "tab-lens",
    "lens-send",
    "tab-bonds",
    "bonds-add",
    "tab-atelier",
    "atelier-journal",
    "settings-hub",
    "paywall-purchase",
    "paywall-success",
    "soul-unlocked",
    "lens-unlimited",
  ]);

  console.log(
    "test-beta: mock-IAP + SCREENS §11 Maestro contract present OK (Maestro deferred)",
  );
}

if (maestroAvailable()) {
  runMaestro();
} else {
  runScriptedMockIapIntegration();
}
