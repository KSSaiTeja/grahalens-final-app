/**
 * Mock IAP when EXPO_PUBLIC_IAP_MODE=mock.
 * Persists entitlement in SecureStore (injectable for Jest).
 */

import * as SecureStore from "expo-secure-store";

import type { PlanId } from "@/lib/billing/catalog";
import { PRIVATE_PLANS } from "@/lib/billing/catalog";
import {
  PRIVATE_ENTITLEMENT_ID,
  PRODUCT_IDS,
} from "@/lib/billing/constants";
import type {
  BillingPackage,
  CustomerInfoLike,
  EntitlementSnapshot,
  OfferingsResult,
} from "@/lib/billing/types";
import { EMPTY_ENTITLEMENT } from "@/lib/billing/types";

const STORAGE_KEY = "grahalens_mock_entitlement_v1";

export type MockSecureStore = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

export type MockEntitlementRecord = {
  productId: string;
  planId: PlanId;
  purchasedAt: string;
  expiresAt: string;
  willRenew: boolean;
  billingIssue: boolean;
  appUserId: string;
};

function defaultSecureStore(): MockSecureStore {
  return {
    getItemAsync: (key) => SecureStore.getItemAsync(key),
    setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
    deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
  };
}

function planIdForProduct(productId: string): PlanId {
  return productId === PRODUCT_IDS.monthly ? "monthly" : "yearly";
}

function expiryForPlan(planId: PlanId, from: Date): string {
  const d = new Date(from.getTime());
  if (planId === "monthly") {
    d.setUTCMonth(d.getUTCMonth() + 1);
  } else {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  }
  return d.toISOString();
}

function parseRecord(raw: string | null): MockEntitlementRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockEntitlementRecord;
    if (
      !parsed ||
      typeof parsed.productId !== "string" ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isActiveRecord(record: MockEntitlementRecord, now: Date): boolean {
  const exp = Date.parse(record.expiresAt);
  if (Number.isNaN(exp)) return false;
  return exp > now.getTime();
}

export function recordToCustomerInfo(
  record: MockEntitlementRecord | null,
  now = new Date(),
): CustomerInfoLike {
  if (!record || !isActiveRecord(record, now)) {
    return { entitlements: { active: {} }, originalAppUserId: record?.appUserId };
  }
  return {
    originalAppUserId: record.appUserId,
    entitlements: {
      active: {
        [PRIVATE_ENTITLEMENT_ID]: {
          isActive: true,
          identifier: PRIVATE_ENTITLEMENT_ID,
          productIdentifier: record.productId,
          expirationDate: record.expiresAt,
          willRenew: record.willRenew,
          billingIssueDetectedAt: record.billingIssue
            ? record.purchasedAt
            : null,
        },
      },
    },
  };
}

export function snapshotFromMockRecord(
  record: MockEntitlementRecord | null,
  now = new Date(),
): EntitlementSnapshot {
  if (!record || !isActiveRecord(record, now)) {
    return {
      ...EMPTY_ENTITLEMENT,
      hydrated: true,
      store: "mock",
      appUserId: record?.appUserId ?? null,
      phase: "ready",
    };
  }
  return {
    hydrated: true,
    isPrivate: true,
    privateUntil: record.expiresAt,
    productId: record.productId,
    planId: record.planId,
    willRenew: record.willRenew,
    billingIssue: record.billingIssue,
    store: "mock",
    appUserId: record.appUserId,
    phase: record.billingIssue ? "billing_issue" : "ready",
    lastError: null,
  };
}

export type MockStore = {
  getRecord(): Promise<MockEntitlementRecord | null>;
  getCustomerInfo(now?: Date): Promise<CustomerInfoLike>;
  getSnapshot(now?: Date): Promise<EntitlementSnapshot>;
  getOfferings(): OfferingsResult;
  purchase(planId: PlanId, now?: Date): Promise<EntitlementSnapshot>;
  restore(now?: Date): Promise<"success" | "empty">;
  clear(): Promise<void>;
  setAppUserId(appUserId: string): Promise<void>;
};

export function createMockStore(
  storage: MockSecureStore = defaultSecureStore(),
  options: { appUserId?: string } = {},
): MockStore {
  let appUserId = options.appUserId ?? "mock-user";

  async function getRecord(): Promise<MockEntitlementRecord | null> {
    return parseRecord(await storage.getItemAsync(STORAGE_KEY));
  }

  async function write(record: MockEntitlementRecord): Promise<void> {
    await storage.setItemAsync(STORAGE_KEY, JSON.stringify(record));
  }

  return {
    getRecord,

    async getCustomerInfo(now = new Date()) {
      return recordToCustomerInfo(await getRecord(), now);
    },

    async getSnapshot(now = new Date()) {
      const snap = snapshotFromMockRecord(await getRecord(), now);
      return { ...snap, appUserId };
    },

    getOfferings(): OfferingsResult {
      const packages: BillingPackage[] = PRIVATE_PLANS.map((plan) => ({
        planId: plan.id,
        productId: plan.productId,
        title: plan.title,
        priceLabel: plan.priceLabel,
        periodLabel: plan.periodLabel,
        badge: plan.badge,
        detail: plan.detail,
        nativePackage: null,
      }));
      return { packages, unavailable: false };
    },

    async purchase(planId, now = new Date()) {
      const plan = PRIVATE_PLANS.find((p) => p.id === planId);
      if (!plan) {
        throw new Error(`Unknown plan: ${planId}`);
      }
      const record: MockEntitlementRecord = {
        productId: plan.productId,
        planId,
        purchasedAt: now.toISOString(),
        expiresAt: expiryForPlan(planId, now),
        willRenew: true,
        billingIssue: false,
        appUserId,
      };
      await write(record);
      return snapshotFromMockRecord(record, now);
    },

    async restore(now = new Date()) {
      const record = await getRecord();
      if (!record || !isActiveRecord(record, now)) return "empty";
      return "success";
    },

    async clear() {
      await storage.deleteItemAsync(STORAGE_KEY);
    },

    async setAppUserId(next) {
      appUserId = next;
      const record = await getRecord();
      if (record) {
        await write({ ...record, appUserId: next });
      }
    },
  };
}

/** Process-wide mock store (SecureStore-backed). */
let singleton: MockStore | null = null;

export function getMockStore(): MockStore {
  if (!singleton) singleton = createMockStore();
  return singleton;
}

/** Test helper — swap / reset singleton. */
export function __setMockStoreForTests(store: MockStore | null): void {
  singleton = store;
}

export function productIdToPlanId(productId: string): PlanId {
  return planIdForProduct(productId);
}
