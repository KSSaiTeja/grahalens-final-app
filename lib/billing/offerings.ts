/**
 * Offerings — TanStack Query lane (PLAN §2). Mock catalog or RevenueCat.
 */

import { useQuery } from "@tanstack/react-query";

import { getIapMode } from "@/lib/billing/constants";
import { getMockStore } from "@/lib/billing/mockStore";
import { getStoreOfferings } from "@/lib/billing/revenueCat";
import type { OfferingsResult } from "@/lib/billing/types";
import { useEntitlementStore } from "@/lib/store/entitlement";

export const offeringsKeys = {
  all: ["billing", "offerings"] as const,
};

export async function fetchOfferings(): Promise<OfferingsResult> {
  useEntitlementStore.getState().setPhase("loading_offerings");
  try {
    const result =
      getIapMode() === "mock"
        ? getMockStore().getOfferings()
        : await getStoreOfferings();

    useEntitlementStore
      .getState()
      .setPhase(result.unavailable ? "failed" : "ready", result.unavailable
        ? "Store offerings unavailable"
        : null);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load offerings";
    useEntitlementStore.getState().setPhase("failed", message);
    return { packages: [], unavailable: true };
  }
}

export function useOfferings() {
  return useQuery({
    queryKey: offeringsKeys.all,
    queryFn: fetchOfferings,
    staleTime: 5 * 60_000,
  });
}
