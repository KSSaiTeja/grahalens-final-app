jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

import {
  createMockStore,
  getMockStore,
  __setMockStoreForTests,
  type MockSecureStore,
} from "@/lib/billing/mockStore";
import {
  isPrivate,
  isPrivateFromInfo,
  requirePrivate,
} from "@/lib/billing/entitlements";
import { purchasePlan } from "@/lib/billing/purchase";
import {
  clearMockEntitlement,
  restorePurchases,
} from "@/lib/billing/restore";
import { PRIVATE_ENTITLEMENT_ID, PRODUCT_IDS } from "@/lib/billing/constants";
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

describe("mock billing", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IAP_MODE = "mock";
    __setMockStoreForTests(
      createMockStore(new MemorySecureStore(), { appUserId: "test-user" }),
    );
    useEntitlementStore.getState().reset();
  });

  afterEach(() => {
    __setMockStoreForTests(null);
  });

  it("purchase unlocks grahalens_private and persists", async () => {
    const result = await purchasePlan("yearly");
    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect(result.snapshot.isPrivate).toBe(true);
    expect(result.snapshot.productId).toBe(PRODUCT_IDS.yearly);
    expect(result.snapshot.planId).toBe("yearly");
    expect(result.snapshot.store).toBe("mock");
    expect(useEntitlementStore.getState().isPrivate).toBe(true);
    expect(isPrivate()).toBe(true);

    const customer = await getMockStore().getCustomerInfo();
    expect(isPrivateFromInfo(customer)).toBe(true);
    expect(customer.entitlements.active[PRIVATE_ENTITLEMENT_ID]?.isActive).toBe(
      true,
    );
  });

  it("restore re-applies entitlement from SecureStore", async () => {
    await purchasePlan("monthly");
    useEntitlementStore.getState().reset();
    expect(isPrivate()).toBe(false);

    const restored = await restorePurchases();
    expect(restored.status).toBe("success");
    if (restored.status !== "success") return;
    expect(restored.snapshot.isPrivate).toBe(true);
    expect(restored.snapshot.productId).toBe(PRODUCT_IDS.monthly);
    expect(isPrivate()).toBe(true);
  });

  it("restore returns empty when nothing purchased", async () => {
    const restored = await restorePurchases();
    expect(restored.status).toBe("empty");
    expect(isPrivate()).toBe(false);
  });

  it("clear removes entitlement so gates return", async () => {
    await purchasePlan("yearly");
    expect(isPrivate()).toBe(true);

    await clearMockEntitlement();
    expect(isPrivate()).toBe(false);
    expect(requirePrivate("soul")).toEqual({
      allowed: false,
      reason: "soul",
      href: "/paywall/sheet?reason=soul",
    });
  });

  it("requirePrivate allows when Private is active", async () => {
    await purchasePlan("monthly");
    expect(requirePrivate("patterns")).toEqual({ allowed: true });
  });
});
