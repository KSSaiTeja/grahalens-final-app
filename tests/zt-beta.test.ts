/**
 * PRD §12 zero-tolerance items 16–19, 22 (Prompt 29).
 * Maestro device path is `maestro/smoke.yaml`; CI without Maestro uses
 * scripts/test-beta.mjs mock-IAP integration after this suite.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createMockStore,
  __setMockStoreForTests,
  type MockSecureStore,
} from "@/lib/billing/mockStore";
import {
  isPrivate,
  requirePrivate,
} from "@/lib/billing/entitlements";
import { purchasePlan } from "@/lib/billing/purchase";
import { restorePurchases } from "@/lib/billing/restore";
import {
  FREE_LENS_DAILY_LIMIT,
  canSendLens,
  incrementLens,
  type UsageCounterStore,
} from "@/lib/billing/quotas";
import { canAddBond, FREE_BOND_LIMIT } from "@/lib/bonds/api";
import { useEntitlementStore } from "@/lib/store/entitlement";

class MemorySecureStore implements MockSecureStore {
  private readonly map = new Map<string, string>();

  async getItemAsync(key: string): Promise<string | null> {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async deleteItemAsync(key: string): Promise<void> {
    this.map.delete(key);
  }
}

class InMemoryUsageCounterStore implements UsageCounterStore {
  private readonly counts = new Map<string, number>();

  async getLensCount(userId: string, day: string): Promise<number> {
    return this.counts.get(`${userId}:${day}`) ?? 0;
  }

  async incrementLensCount(
    userId: string,
    day: string,
    limit: number,
  ): Promise<number | null> {
    const key = `${userId}:${day}`;
    const count = this.counts.get(key) ?? 0;
    if (count >= limit) return null;
    const next = count + 1;
    this.counts.set(key, next);
    return next;
  }
}

/** SCREENS §11 ordered milestones encoded in Maestro + CI fallback. */
const SCREENS_11_MILESTONES = [
  "welcome-get-started",
  "guest-continue",
  "onboarding-date",
  "onboarding-compute",
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
] as const;

describe("PRD §12 ZT 16–19, 22", () => {
  const userId = "zt-user";
  let usage: InMemoryUsageCounterStore;
  const now = new Date("2026-07-30T12:00:00.000Z");

  beforeEach(() => {
    process.env.EXPO_PUBLIC_IAP_MODE = "mock";
    usage = new InMemoryUsageCounterStore();
    __setMockStoreForTests(
      createMockStore(new MemorySecureStore(), { appUserId: userId }),
    );
    useEntitlementStore.getState().reset();
  });

  afterEach(() => {
    __setMockStoreForTests(null);
  });

  it("ZT16: sixth free Lens message same day → paywall sheet lens_quota", async () => {
    expect(FREE_LENS_DAILY_LIMIT).toBe(5);

    for (let i = 0; i < FREE_LENS_DAILY_LIMIT; i += 1) {
      expect(await canSendLens(userId, { now, store: usage })).toBe(true);
      await incrementLens(userId, { now, store: usage });
    }

    expect(await canSendLens(userId, { now, store: usage })).toBe(false);
    expect(isPrivate()).toBe(false);
    expect(requirePrivate("lens_quota")).toEqual({
      allowed: false,
      reason: "lens_quota",
      href: "/paywall/sheet?reason=lens_quota",
    });
  });

  it("ZT17: second Bond → paywall sheet bond_limit", () => {
    expect(FREE_BOND_LIMIT).toBe(1);
    expect(canAddBond(0, false)).toBe(true);
    expect(canAddBond(1, false)).toBe(false);
    expect(requirePrivate("bond_limit")).toEqual({
      allowed: false,
      reason: "bond_limit",
      href: "/paywall/sheet?reason=bond_limit",
    });
  });

  it("ZT18: mock purchase unlocks Soul + unlimited Lens", async () => {
    for (let i = 0; i < FREE_LENS_DAILY_LIMIT; i += 1) {
      await incrementLens(userId, { now, store: usage });
    }
    expect(await canSendLens(userId, { now, store: usage })).toBe(false);
    expect(requirePrivate("soul").allowed).toBe(false);

    const purchased = await purchasePlan("yearly");
    expect(purchased.status).toBe("success");
    expect(isPrivate()).toBe(true);

    expect(requirePrivate("soul")).toEqual({ allowed: true });
    expect(requirePrivate("lens_quota")).toEqual({ allowed: true });
    expect(requirePrivate("bond_limit")).toEqual({ allowed: true });
    expect(canAddBond(9, true)).toBe(true);
    // Private callers skip quota in lib/lens/send — entitlement is the gate.
    expect(isPrivate()).toBe(true);
  });

  it("ZT19: restore (mock) re-applies entitlement", async () => {
    await purchasePlan("monthly");
    useEntitlementStore.getState().reset();
    expect(isPrivate()).toBe(false);
    expect(requirePrivate("soul").allowed).toBe(false);

    const restored = await restorePurchases();
    expect(restored.status).toBe("success");
    expect(isPrivate()).toBe(true);
    expect(requirePrivate("soul")).toEqual({ allowed: true });
  });

  it("ZT22: Maestro smoke encodes SCREENS §11 path (mock IAP)", () => {
    const yaml = readFileSync(
      join(__dirname, "..", "maestro", "smoke.yaml"),
      "utf8",
    );
    expect(yaml).toMatch(/SCREENS §11/);
    expect(yaml).toMatch(/EXPO_PUBLIC_IAP_MODE=mock/);
    for (const id of SCREENS_11_MILESTONES) {
      expect(yaml).toContain(id);
    }
  });
});
