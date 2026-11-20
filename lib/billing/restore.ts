/**
 * Restore purchases — mock SecureStore re-read or RevenueCat restorePurchases.
 */

import { getIapMode } from "@/lib/billing/constants";
import { getMockStore } from "@/lib/billing/mockStore";
import {
  customerInfoToLike,
  restoreStorePurchases,
  snapshotFromCustomerInfo,
} from "@/lib/billing/revenueCat";
import { syncPrivateUntil } from "@/lib/billing/sync-profile";
import type { RestoreResult } from "@/lib/billing/types";
import { track } from "@/lib/analytics";
import { useEntitlementStore } from "@/lib/store/entitlement";

export async function restorePurchases(): Promise<RestoreResult> {
  const store = useEntitlementStore.getState();
  store.setPhase("restoring");

  try {
    if (getIapMode() === "mock") {
      const mock = getMockStore();
      const outcome = await mock.restore();
      if (outcome === "empty") {
        const snapshot = await mock.getSnapshot();
        store.applySnapshot(snapshot);
        store.setPhase("empty");
        return { status: "empty" };
      }
      const snapshot = await mock.getSnapshot();
      store.applySnapshot(snapshot);
      void syncPrivateUntil(snapshot);
      store.setPhase("success");
      track("restore_success", { mode: "mock" });
      return { status: "success", snapshot };
    }

    const info = await restoreStorePurchases();
    const snapshot = snapshotFromCustomerInfo(customerInfoToLike(info));
    store.applySnapshot(snapshot);
    void syncPrivateUntil(snapshot);

    if (!snapshot.isPrivate) {
      store.setPhase("empty");
      return { status: "empty" };
    }
    store.setPhase("success");
    track("restore_success", { mode: "store" });
    return { status: "success", snapshot };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Restore failed";
    store.setPhase("failed", message);
    return { status: "failed", message };
  }
}

/** Dev / TESTING.md — clear mock entitlement so gates return. */
export async function clearMockEntitlement(): Promise<void> {
  if (getIapMode() !== "mock") {
    throw new Error("clearMockEntitlement only available in mock IAP mode");
  }
  await getMockStore().clear();
  const snapshot = await getMockStore().getSnapshot();
  useEntitlementStore.getState().applySnapshot(snapshot);
  void syncPrivateUntil(snapshot);
}
