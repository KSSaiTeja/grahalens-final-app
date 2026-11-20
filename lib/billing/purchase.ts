/**
 * Purchase flow — mock SecureStore or RevenueCat purchasePackage.
 */

import type { PlanId } from "@/lib/billing/catalog";
import { getIapMode } from "@/lib/billing/constants";
import { getMockStore } from "@/lib/billing/mockStore";
import { fetchOfferings } from "@/lib/billing/offerings";
import {
  customerInfoToLike,
  purchaseStorePackage,
  snapshotFromCustomerInfo,
} from "@/lib/billing/revenueCat";
import { syncPrivateUntil } from "@/lib/billing/sync-profile";
import type { PurchaseResult } from "@/lib/billing/types";
import { track } from "@/lib/analytics";
import { useEntitlementStore } from "@/lib/store/entitlement";

function isUserCancelled(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { userCancelled?: boolean; code?: string | number };
  if (e.userCancelled === true) return true;
  // RevenueCat PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR === "1"
  return e.code === "1" || e.code === 1;
}

export async function purchasePlan(planId: PlanId): Promise<PurchaseResult> {
  const store = useEntitlementStore.getState();
  store.setPhase("purchasing");
  track("purchase_started", { planId, mode: getIapMode() });

  try {
    if (getIapMode() === "mock") {
      const snapshot = await getMockStore().purchase(planId);
      store.applySnapshot(snapshot);
      void syncPrivateUntil(snapshot);
      store.setPhase("success");
      track("purchase_success", { planId, mode: "mock" });
      return { status: "success", snapshot };
    }

    const offerings = await fetchOfferings();
    const pkg = offerings.packages.find((p) => p.planId === planId);
    if (!pkg?.nativePackage) {
      const message = offerings.unavailable
        ? "Store unavailable"
        : "Selected plan is not available";
      store.setPhase("failed", message);
      track("purchase_failed", { planId, reason: message });
      return { status: "failed", message };
    }

    const info = await purchaseStorePackage(pkg.nativePackage);
    const snapshot = snapshotFromCustomerInfo(customerInfoToLike(info), "success");
    store.applySnapshot(snapshot);
    void syncPrivateUntil(snapshot);
    store.setPhase("success");
    track("purchase_success", { planId, mode: "store" });
    return { status: "success", snapshot };
  } catch (err) {
    if (isUserCancelled(err)) {
      store.setPhase("cancelled");
      track("purchase_cancelled", { planId });
      return { status: "cancelled" };
    }
    const message =
      err instanceof Error ? err.message : "Purchase failed";
    store.setPhase("failed", message);
    track("purchase_failed", { planId, reason: message });
    return { status: "failed", message };
  }
}
